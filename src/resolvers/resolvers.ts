// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.

import listResolver from './list_resolver';
import taskResolver from './task_resolver';
import userResolver from './user_resolver';

export default [listResolver, taskResolver, userResolver];