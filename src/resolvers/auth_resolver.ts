import { ForbiddenError } from 'apollo-server';
import { skip, TArgs } from 'graphql-resolvers';
import { IContext } from './resolver_interfaces';

export const isAuthenticated = (_: undefined, __: TArgs, context: IContext) => {
    if(context.auth){
        skip
    }
    else{
        throw new ForbiddenError('Usuario no identificado')
    }
};

export const isListOwner = async (_: undefined, args: TArgs, context: IContext) => {
    if(context.auth){
        const result = await context.models.List.findOne({
            where:{
                id: args.id,
            }
        });
    
        if(result.userId == context.auth.id){
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


export const permitedTaskDelete = async (_: undefined, args: TArgs, context: IContext) => {
    if(args.inPublicList){
        skip
    }
    else{
        if(context.auth){
            const result = await context.models.Task.findOne({
                where:{
                    id: args.id,
                }
            });
        
            if(result.userId == context.auth.id){
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

