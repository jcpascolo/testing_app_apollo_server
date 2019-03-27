import { ForbiddenError } from 'apollo-server';
import { skip } from 'graphql-resolvers';

export const isAuthenticated = (parent, args, {auth}) => {
    if(auth){
        skip
    }
    else{
        throw new ForbiddenError('Usuario no identificado')
    }
};

