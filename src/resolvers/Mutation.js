import bcrypt from 'bcrypt'
import getUserId from '../utils/getUserId'
import generateToken from '../utils/generateToken'
import hashPassword from '../utils/hashPassword'
import request from 'superagent'
import throwError from '../utils/throwError'

const Mutation = {
  async createUser(parent, args, { prisma }) {
    if (
      process.env.ENV === 'test' ||
      process.env.ENV === 'prod' ||
      process.env.ENV === 'dev'
    ) {
      const reCAPTCHAVerify = await request
        .post(
          `https://www.google.com/recaptcha/api/siteverify?secret=${
            process.env.RECAPTCHA_SECRET
          }&response=${args.data.reCAPTCHAToken}`
        )
        .catch((err) => {
          throwError(1000, undefined, err)
        })
      if (reCAPTCHAVerify.body.success !== true) {
        throwError(1001, 'reCAPTCHA verification failed, please reCAPTCHA')
      }
      const validEmail = await request
        .post(`${process.env.SUBSCRIPTION_SERVER}`)
        .send(`EMAIL=${args.data.email}`)
        .catch((err) => {
          throwError(2000, undefined, err)
        })

      if (validEmail.text.includes('invalid email')) {
        throwError(
          2001,
          'the email is invalid or is a temporary email, please use another email'
        )
      }
    }
    delete args.data.reCAPTCHAToken
    const password = await hashPassword(args.data.password)
    const user = await prisma.mutation
      .createUser({
        data: {
          ...args.data,
          password,
        },
      })
      .catch((err) => {
        throwError(3000, undefined, err)
      })

    return {
      user,
      token: generateToken(user.id),
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
      token: generateToken(user.id),
    }
  },
  async deleteUser(parent, args, { prisma, request }, info) {
    const userId = getUserId(request)

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
    const userId = getUserId(request)

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
