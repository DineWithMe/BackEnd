import getDecodedToken from '../utils/getDecodedToken'
import generateToken from '../utils/generateToken'
import request from 'superagent'
import throwError from '../utils/throwError'
import moment from 'moment'
import { avatarExist } from '../utils/folderOperation'

const Query = {
  async users(parent, args, { prisma }, info) {
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
    // prisma.query.users(opArgs, info) return only requested field
    // prisma.query.users(opArgs) return all scalar field
    // if we return prisma.query.users(opArgs), graphql yoga will return it as if prisma.query.users(opArgs, info)
    return prisma.query.users(opArgs, info)
  },
  me(parent, args, { prisma, request }, info) {
    const userId = getDecodedToken(request).userId
    const user = prisma.query.user(
      {
        where: {
          id: userId,
        },
      },
      info
    )
    return avatarExist(user)
  },
  async user(parent, args, { prisma }, info) {
    const user = await prisma.query.user(
      {
        where: {
          username: args.username,
        },
      },
      info
    )
    return avatarExist(user)
  },
  async emailExist(parent, args, { prisma }, info) {
    // check whether the email truly belong to someone
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
          email: args.email,
        },
      },
      info
    )
  },
  async verifyToken(parent, args, { prisma, request }) {
    const decoded = getDecodedToken(request)
    let { userToken, userId } = decoded

    // root field of prisma exist depend directly on data model
    const user = await prisma.query.user({
      where: {
        id: userId,
      },
    })

    if (!user) {
      throwError(6001, 'user not exist')
    }

    // refresh token if validity is less then 7 days
    if (decoded.exp - moment().format('X') < 86400 * 7) {
      const { id, username, name } = user
      userToken = generateToken({ userId: id, username, name })
    }
    return {
      user,
      userToken,
    }
  },
}

export { Query as default }
