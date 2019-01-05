import getDecodedToken from '../utils/getDecodedToken'
import request from 'superagent'
import throwError from '../utils/throwError'
// import serverAcceptsEmail from 'server-accepts-email'

const Query = {
  users(parent, args, { prisma }, info) {
    const opArgs = {
      first: args.first,
      skip: args.skip,
      after: args.after,
      orderBy: args.orderBy,
    }

    if (args.query) {
      opArgs.where = {
        OR: [
          {
            name_contains: args.query,
          },
        ],
      }
    }

    return prisma.query.users(opArgs, info)
  },
  me(parent, args, { prisma, request }, info) {
    const userId = getDecodedToken(request).userId

    return prisma.query.user(
      {
        where: {
          id: userId,
        },
      },
      info
    )
  },
  userExist(parent, args, { prisma }, info) {
    return prisma.query.user(
      {
        where: {
          username: args.query,
        },
      },
      info
    )
  },
  async emailExist(parent, args, { prisma }, info) {
    const emailExist = await request.get(
      `https://app.verify-email.org/api/v1/${
        process.env.VERIFY_EMAIL_APIKEY
      }/verify/${args.query}`
    )

    if (emailExist.body.status !== 1) {
      throwError(4001, 'invalid email, please use another email')
    }

    return prisma.query.user(
      {
        where: {
          email: args.query,
        },
      },
      info
    )
  },
  verifyToken(parent, args, { prisma, request }, info) {
    const { userId, token } = getDecodedToken(request)

    return {
      user: prisma.query.user(
        {
          where: {
            id: userId,
          },
        },
        info
      ),
      token: token,
    }
  },
}

export { Query as default }
