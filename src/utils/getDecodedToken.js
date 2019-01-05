import jwt from 'jsonwebtoken'
import throwError from './throwError'

const getUserId = (request, requireAuth = true) => {
  const header = request.request
    ? request.request.headers.authorization
    : request.connection.context.Authorization

  if (header) {
    const userToken = header.replace('Bearer ', '')
    let decoded
    try {
      decoded = jwt.verify(userToken, process.env.JWT_SECRET)
      decoded.userToken = userToken
      return decoded
    } catch (err) {
      throwError(5000, 'Authentication failed', err)
    }
  }

  if (requireAuth) {
    throwError(5001, 'Authentication required')
  }
  // return object rathe than null since it is now return object
  return {}
}

export { getUserId as default }
