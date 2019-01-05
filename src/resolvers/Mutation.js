import bcrypt from 'bcrypt'
import getDecodedToken from '../utils/getDecodedToken'
import generateToken from '../utils/generateToken'
import hashPassword from '../utils/hashPassword'
import request from 'superagent'
import throwError from '../utils/throwError'

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
        .send(`EMAIL=${email}`)
        .catch((err) => {
          throwError(2000, err)
        })

      if (validEmail.text.includes('invalid email')) {
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
          username,
          name,
          email,
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
    const user = await prisma.query.user({
      where: {
        email: args.data.email,
      },
    })

    if (!user) {
      throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(args.data.password, user.password)

    if (!isMatch) {
      throw new Error('Unable to login')
    }

    return {
      user,
      userToken: generateToken(user.id),
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
}

export { Mutation as default }
