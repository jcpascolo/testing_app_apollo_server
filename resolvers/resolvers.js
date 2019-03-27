// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.

import listResolver from './list_resolver.js';
import taskResolver from './task_resolver.js';
import userResolver from './user_resolver.js';

export default [listResolver, taskResolver, userResolver];