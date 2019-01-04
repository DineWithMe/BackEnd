import bcrypt from 'bcrypt'
import prisma from '../../src/prismaBinding'
import generateToken from '../../src/utils/generateToken'
import hashPassword from '../../src/utils/hashPassword'

const userOne = {
  input: {
    name: 'jen',
    username: 'jen',
    email: 'jen@example.com',
    password: hashPassword('Red098!@#$', true),
    emailVerified: false,
  },
  user: undefined,
  jwt: undefined,
}

const userTwo = {
  input: {
    name: 'jeff',
    username: 'jeff',
    email: 'jeff@example.com',
    password: hashPassword('PassForJeff', true),
    emailVerified: false,
  },
  user: undefined,
  jwt: undefined,
}

const seedDatabase = async () => {
  jest.setTimeout(100000)
  // Delete test data
  await prisma.mutation.deleteManyUsers()

  // Create user one
  userOne.user = await prisma.mutation.createUser({
    data: userOne.input,
  })
  userOne.jwt = generateToken(
    { userInfo: { userId: userOne.user.id, name: 'jen', username: 'jen' } },
    process.env.JWT_SECRET
  )

  // Create user two
  userTwo.user = await prisma.mutation.createUser({
    data: userTwo.input,
  })
  userTwo.jwt = generateToken(
    { userInfo: { userId: userTwo.user.id, name: 'jeff', username: 'jeff' } },
    process.env.JWT_SECRET
  )
}

export { seedDatabase as default, userOne, userTwo }
