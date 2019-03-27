
// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.

import { gql } from 'apollo-server-express';

import listSchema from './list_schema.js';
import taskSchema from './task_schema.js';
import userSchema from './user_schema';

const linkSchema = gql`
  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }

  type Subscription {
    _: Boolean
  }
`;

export default [linkSchema, listSchema, taskSchema, userSchema];
