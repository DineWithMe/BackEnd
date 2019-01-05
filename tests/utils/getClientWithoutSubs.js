import ApolloBoost from 'apollo-boost'

const getClient = (userToken) => {
  return new ApolloBoost({
    uri: process.env.NODE_ENDPOINT,
    request(operation) {
      if (userToken) {
        operation.setContext({
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        })
      }
    },
  })
}

export { getClient as default }
