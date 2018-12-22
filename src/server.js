import { GraphQLServer, PubSub } from 'graphql-yoga'
import { resolvers, fragmentReplacements } from './resolvers/index'
import { emailConfirmation } from './controller/emailConfirmation'
import cors from 'cors'
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

server.express.use(cors())

server.express.use(bodyParser.urlencoded())

server.express.get('/emailConfirmation', (req, res) => {
  emailConfirmation(req, res)
})
server.express.post('/emailConfirmation', (req, res) => {
  res.status(200).json('success')
})

export { server as default }
