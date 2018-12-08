import '@babel/polyfill/noConflict'
import server from './server'
/* eslint-disable no-alert, no-console */
server.start({ port: process.env.NODE_PORT || 4000 }, () => {
  console.log('The server is up!')
})
