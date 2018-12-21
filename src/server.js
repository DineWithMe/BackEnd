import { GraphQLServer, PubSub } from 'graphql-yoga'
import { resolvers, fragmentReplacements } from './resolvers/index'
import { handleMailChimp } from './controller/mailChimp'
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

server.express.get('/mailchimp', (req, res) => {
  handleMailChimp(req, res)
})
server.express.post('/mailchimp', (req, res) => {
  res.json('success')
})

export { server as default }
