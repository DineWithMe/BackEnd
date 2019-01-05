import getDecodedToken from '../utils/getDecodedToken'
import generateToken from '../utils/generateToken'
import request from 'superagent'
import throwError from '../utils/throwError'
import moment from 'moment'
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
    const emailExist = await request
      .get(
        `https://app.verify-email.org/api/v1/${
          process.env.VERIFY_EMAIL_APIKEY
        }/verify/${args.query}`
      )
      .catch((err) => {
        throwError(4000, err)
      })

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
  async verifyToken(parent, args, { request }, info) {
    const decoded = getDecodedToken(request)
    let { userToken } = decoded
    // refresh token if less then 7 days
    if (decoded.exp - moment().format('X') < 86400 * 7) {
      delete decoded.userToken
      delete decoded.iat
      delete decoded.exp
      userToken = generateToken(decoded)
    }
    return {
      userToken,
    }
  },
}

export { Query as default }
