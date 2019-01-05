import bcrypt from 'bcrypt'

const hashPassword = (password, sync) => {
  if (password.length < 8) {
    throw new Error('Password must be 8 characters or longer.')
  }

  return sync ? bcrypt.hashSync(password, 10) : bcrypt.hash(password, 10)
}

export { hashPassword as default }
