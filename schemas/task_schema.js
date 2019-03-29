import { gql } from 'apollo-server-express'

export default gql`
    # Comments in GraphQL are defined with the hash (#) symbol.
    
    type Task {
        id: ID!
        list: List!
        text: String!
        done: Boolean!
        listId: ID!
        userId: ID!
    }

    # The "Query" type is the root of all GraphQL queries.
    extend type Query {
        tasks(listId: ID!): [Task]
        task(id: ID!): Task
    }

    extend type Mutation {
        addTask(listId: ID!, text: String!): Task
        deleteTasks(id: [ID!]): String
        #deleteMultipleTasks(id_array: [ID!]!): String
        markDone(id: ID!, done: Boolean!): Boolean
    }

    enum allowedTaskAction {
        CREATE
        ISDONE
    }

    type TaskResponse {
        task: Task
        action: allowedTaskAction
    }

    type deleteResponse {
        ids: [ID!]
    }

    extend type Subscription{
        updateSub: TaskResponse
        deleteSub: deleteResponse
    }
`;