import { gql } from 'apollo-boost'

const createUser = gql`
  mutation($data: CreateUserInput!) {
    createUser(data: $data) {
      userToken
      user {
        id
        name
        email
        username
      }
    }
  }
`

const getUsers = gql`
  query {
    users {
      id
      name
      email
    }
  }
`

const login = gql`
  mutation($data: LoginUserInput!) {
    login(data: $data) {
      userToken
    }
  }
`

const getProfile = gql`
  query {
    me {
      id
      name
      email
    }
  }
`

export { createUser, login, getUsers, getProfile }
