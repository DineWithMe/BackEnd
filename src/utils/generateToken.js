import jwt from 'jsonwebtoken'

const generateToken = (userInfo) => {
  return jwt.sign(userInfo, process.env.JWT_SECRET, { expiresIn: '7 days' })
}

export { generateToken as default }
