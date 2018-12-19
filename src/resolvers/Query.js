import getUserId from '../utils/getUserId'
import serverAcceptsEmail from 'server-accepts-email'

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
    const emailExist = await serverAcceptsEmail(args.query)

    if (!emailExist) throw new Error('email is not exist')

    return prisma.query.user(
      {
        where: {
          email: args.query,
        },
      },
      info
    )
  },
}

export { Query as default }
