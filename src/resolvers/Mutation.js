import bcrypt from 'bcrypt'
import getUserId from '../utils/getUserId'
import generateToken from '../utils/generateToken'
import hashPassword from '../utils/hashPassword'
import request from 'superagent'

const Mutation = {
  async createUser(parent, args, { prisma }) {
    if (
      process.env.ENV === 'test' ||
      process.env.ENV === 'prod' ||
      process.env.ENV === 'dev'
    ) {
      const recaptchaVerify = await request
        .post(
          `https://www.google.com/recaptcha/api/siteverify?secret=${
            process.env.RECAPTCHA_SECRET
          }&response=${args.data.recaptchaToken}`
        )
        .catch((err) => {
          throw new Error(err.message)
        })
      if (recaptchaVerify.body.success !== true) {
        throw new Error('recaptcha verification failed')
      }
      await request
        .post(`${process.env.SUBSCRIPTION_SERVER}`)
        .send(`EMAIL=${args.data.email}`)
        .catch((err) => {
          throw new Error(err.message)
        })
    }
    delete args.data.recaptchaToken
    const password = await hashPassword(args.data.password)
    const user = await prisma.mutation
      .createUser({
        data: {
          ...args.data,
          password,
        },
      })
      .catch((err) => {
        throw new Error(err.message)
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
