import prisma from '../prismaBinding'

const emailConfirmation = (req, res) => {
  // use req.query for url query param
  if (req.query.secret !== process.env.MAILING_WEBHOOK_SECRET) {
    throw new Error('Warning, this is not request made by Mailchimp!')
  }

  prisma.mutation
    .updateUser({
      data: { emailVerified: true },
      where: { email: req.body.data.email },
    })
    .catch((err) => {
      throw new Error(err.message)
    })

  return res.status(200).json('success')
}

export { emailConfirmation }
