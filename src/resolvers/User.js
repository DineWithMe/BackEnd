import getDecodedToken from '../utils/getDecodedToken'

const User = {
  email: {
    fragment: 'fragment userId on User { id }',
    resolve(parent, args, { request }) {
      const userId = getDecodedToken(request, false).userId
      if (userId && userId === parent.id) {
        return parent.email
      } else {
        return null
      }
    },
  },
}

export { User as default }
