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

export const isListOwner = async (parent, args, {models, auth}) => {
    if(auth){
        const result = await models.List.findOne({
            where:{
                id: args.id,
            }
        });
    
        if(result.userId == auth.id){
            skip
        }
        else{
            throw new ForbiddenError('Usuario no valido, no es usted el dueño de la lista')
        }
    }
    else{
        throw new ForbiddenError('Usuario no identificado')
    }
    
}


export const permitedTaskDelete = async (parent, args, {models, auth}) => {
    if(args.inPublicList){
        skip
    }
    else{
        if(auth){
            const result = await models.Task.findOne({
                where:{
                    id: args.id,
                }
            });
        
            if(result.userId == auth.id){
                skip
            }
            else{
                throw new ForbiddenError('Usuario no valido, no es usted el dueño de la lista')
            }
        }
        else{
            throw new ForbiddenError('Usuario no identificado')
        }
    }
    
    
}

