import ApolloBoost from 'apollo-boost'

const getClient = (token) => {
  return new ApolloBoost({
    uri: process.env.NODE_ENDPOINT,
    request(operation) {
      if (token) {
        operation.setContext({
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      }
    },
  })
}

export { getClient as default }
