import {gql} from 'apollo-server-express';

export const typeDefs = gql`

  input GroupsReq {
    offset: Int!
    size: Int!
  }

  type Group {
    _id: ID!
    name: String!
  }

  type GroupsResponse {
    groups: [Group]!
    offset: Int!
    size: Int!
  }

  type User {
    _id: ID!
    name: String!
    email: String!
    key: String!
  }

  input signinReq {
    email: String!
    key: String!
  }

  input newUser {
    name: String!
    key: String!
    email: String!
  }

  type Message {
    groupId: ID!
    message: String!
    user: String!
    ts: Int!
  }

  type Error {
    message:String!
    status: Int!
  }

  type Query {
    hello: String!
    groups (GroupsReq: GroupsReq!): GroupsResponse!
  }

  type Mutation {
    registerUser (user: newUser!): ID!
    signIn (user: signinReq!): Boolean!
  }

  type Subscription {
    newMessage (groupId: String!): Int
  }

`;





// type Mutation {
//   createUser(name: String!, email: String!, key: String!) : user!
// }
