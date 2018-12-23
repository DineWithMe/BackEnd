const emailConfirmation = (req, res) => {
  // use req.query for url query param
  if (req.query.secret !== process.env.MAILING_WEBHOOK_SECRET) {
    throw new Error('Warning, this is not request made by Mailchimp!')
  }

  return res.status(200).json('success')
}

export { emailConfirmation }
