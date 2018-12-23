import { GraphQLServer, PubSub } from 'graphql-yoga'
import { resolvers, fragmentReplacements } from './resolvers/index'
import { emailConfirmation } from './controller/emailConfirmation'
import bodyParser from 'body-parser'
import prisma from './prismaBinding'

const pubsub = new PubSub()

const server = new GraphQLServer({
  typeDefs: process.env.CLIENT_SCHEMA,
  resolvers,
  context(request) {
    return {
      pubsub,
      prisma,
      request,
    }
  },
  fragmentReplacements,
})

server.express.use(bodyParser.urlencoded())

// MailChimp need both get and post request
server.express.get('/emailConfirmation', (req, res) => {
  emailConfirmation(req, res)
})
server.express.post('/emailConfirmation', (req, res) => {
  emailConfirmation(req, res)
})

export { server as default }
