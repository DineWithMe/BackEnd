import getUserId from '../utils/getUserId'
import fetch from 'node-fetch'
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
    const emailExist = await fetch(
      `https://app.verify-email.org/api/v1/${
        process.env.VERIFY_EMAIL_API
      }/verify/${args.query}`
    ).then((res) => res.json())

    if (emailExist.status !== 1) throw new Error('email is not exist')

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
