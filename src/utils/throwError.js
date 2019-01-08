const throwError = (statusCode, error, message) => {
  // https://stackoverflow.com/questions/50954538/javascript-can-you-throw-an-object-in-an-error
  throw new Error(
    JSON.stringify({
      statusCode,
      message: message || error.message || error,
      error,
    })
  )
}

export default throwError
