import { gql } from 'apollo-server-express';

export default gql`

    type User {
        id: ID!
        username: String!
        email: String!
        password: String!
    }

    extend type Query{
        users: [User]
        user(id: ID!): User
    }

    type Token {
        username: String!
        token: String!
    }

    extend type Mutation {
        addUser(username: String!, email: String!, password: String!): Token!
        logIn(email: String!, password: String!): Token!
        deleteUser(id: ID!): String!
    }

    type UserResponse {
        user: User!
        action: Boolean!
    }

    extend type Subscription {
        userSub: UserResponse
    }

`;