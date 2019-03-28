import { gql } from 'apollo-server-express'

export default gql`
    # Comments in GraphQL are defined with the hash (#) symbol.

    type List {
        id: ID!
        name: String!
        tasks: [Task!]
        userId: ID!
        public: Boolean!
    }

    # The "Query" type is the root of all GraphQL queries.
    extend type Query {
        lists: [List]
        list(id: ID!): List
    }

    extend type Mutation {
        addList(name: String!, public: Boolean!): List!
        deleteList(id: ID!): String!
    }

    enum allowedListAction {
        CREATE
        DESTROY
    }

    type ListResponse {
        list: List
        action: allowedListAction
    }

    extend type Subscription{
        listSub: ListResponse
    }

`;