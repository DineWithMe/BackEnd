import bcrypt from 'bcryptjs'
import getDecodedToken from '../utils/getDecodedToken'
import generateToken from '../utils/generateToken'
import hashPassword from '../utils/hashPassword'
import request from 'superagent'
import throwError from '../utils/throwError'
import storeUpload from '../utils/storeUpload'

const Mutation = {
  async createUser(parent, args, { prisma }) {
    const {
      data: { username, name, password, email, reCAPTCHAToken },
    } = args
    if (
      process.env.ENV === 'test' ||
      process.env.ENV === 'prod' ||
      process.env.ENV === 'dev'
    ) {
      if (reCAPTCHAToken !== process.env.RECAPTCHA_BYPASS) {
        const reCAPTCHAVerify = await request
          .post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${
              process.env.RECAPTCHA_SECRET
            }&response=${reCAPTCHAToken}`
          )
          .catch((err) => {
            throwError(1000, err)
          })
        if (reCAPTCHAVerify.body.success !== true) {
          throwError(1001, 'reCAPTCHA verification failed, please reCAPTCHA')
        }
      }
      const validEmail = await request
        .post(`${process.env.SUBSCRIPTION_SERVER}`)
        .send(`EMAIL=${email}`) // sending form data
        .catch((err) => {
          throwError(2000, err)
        })

      if (validEmail.text.includes('invalid email')) {
        // this is a hacky way to check whether mail chimp reject the email for some reason
        throwError(
          2001,
          'the email is invalid or is a temporary email, please use another email'
        )
      }
    }
    const hashedPassword = await hashPassword(password)
    const user = await prisma.mutation
      .createUser({
        data: {
          username: username.toLowerCase(),
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
        },
      })
      .catch((err) => {
        throwError(3000, err)
      })
    return {
      user,
      userToken: generateToken({
        userId: user.id,
        username: username,
        name: name,
      }),
    }
  },
  async login(parent, args, { prisma }) {
    const {
      data: { emailOrUsername, password },
    } = args
    const users = await prisma.query
      .users({
        where: {
          OR: [
            {
              email: emailOrUsername.toLowerCase(),
            },
            {
              username: emailOrUsername.toLowerCase(),
            },
          ],
        },
      })
      .catch((err) => {
        throwError(7000, err)
      })
    const user = users[0]
    if (!user) {
      throwError(7001, 'username or password mismatch')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      throwError(7001, 'username or password mismatch')
    }
    const { id, name, username } = user
    return {
      user,
      userToken: generateToken({
        userId: id,
        username: username,
        name: name,
      }),
    }
  },
  async deleteUser(parent, args, { prisma, request }, info) {
    const userId = getDecodedToken(request).userId

    return prisma.mutation.deleteUser(
      {
        where: {
          id: userId,
        },
      },
      info
    )
  },
  async updateUser(parent, args, { prisma, request }, info) {
    const userId = getDecodedToken(request).userId

    if (typeof args.data.password === 'string') {
      args.data.password = await hashPassword(args.data.password)
    }

    return prisma.mutation.updateUser(
      {
        where: {
          id: userId,
        },
        data: args.data,
      },
      info
    )
  },
  async uploadUserAvatar(parent, args, { prisma, request }) {
    const { stream, filename, mimetype, encoding } = await args.file
    await storeUpload({
      stream,
      folder: `${process.cwd()}/user_avatar`,
      filename,
    })
    return { filename }
  },
}

export { Mutation as default }
