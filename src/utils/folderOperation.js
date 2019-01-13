import { USER_AVATAR } from '../constants/folder'
import { existsSync } from 'fs'

const avatarExist = (user) => {
  if (user && !existsSync(`${USER_AVATAR}${user.avatarFilename}`)) {
    // if no avatar found null the name
    user.avatarFilename = null
  }
  return user
}

export { avatarExist }
