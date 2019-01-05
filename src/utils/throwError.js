const throwError = (statusCode, message, error) => {
  // https://stackoverflow.com/questions/50954538/javascript-can-you-throw-an-object-in-an-error
  if (statusCode % 2 === 0) {
    message = 'network failed'
  }
  throw new Error(
    JSON.stringify({ statusCode, message: message || error.message, error })
  )
}

export default throwError
