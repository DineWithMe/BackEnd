import '@babel/polyfill/noConflict'
import server from './server'

const whitelist = ['https://dinewithme.app', 'http://localhost:3000']

server.start(
  {
    cors: {
      origin: (origin, callback) => {
        if (whitelist.indexOf(origin) !== -1) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'))
        }
      },
    },
    port: process.env.NODE_PORT || 4000,
  },
  () => {
    // eslint-disable-next-line no-console
    console.log('The server is up!')
  }
)
