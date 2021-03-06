import '@babel/polyfill/noConflict'
import server from './server'

let whitelist = ['https://dinewithme.app']

if (process.env.ENV !== 'prod') {
  whitelist.push('http://localhost:3000', 'http://localhost:4000', undefined)
}
// undefined origin indicate no origin(from itself) https://github.com/expressjs/cors/issues/118

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
