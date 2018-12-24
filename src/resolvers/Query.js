import getUserId from '../utils/getUserId'
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
  me(parent, args, { prisma, request }) {
    const userId = getUserId(request)

    return prisma.query.user({
      where: {
        id: userId,
      },
    })
  },
  async userExist(parent, args, { prisma }, info) {
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

    return prisma.query
      .user(
        {
          where: {
            email: args.query,
          },
        },
        info
      )
      .catch((err) => {
        throwError(4000, 'network failed', err)
      })
  },
}

export { Query as default }
