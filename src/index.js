import '@babel/polyfill/noConflict'
import server from './server'
/* eslint-disable no-alert, no-console */
server.start(
  {
    cors: { origin: 'https://dinewithme.app/*' },
    port: process.env.NODE_PORT || 4000,
  },
  () => {
    console.log('The server is up!')
  }
)
