import { RedisPubSub } from 'graphql-redis-subscriptions';

import { combineResolvers } from 'graphql-resolvers';
import { isAuthenticated, permitedTaskDelete } from './auth_resolver';

const pubsub = new RedisPubSub({
    connection:{
        host: process.env.RD_HOST || '127.0.0.1',
        port: parseInt(process.env.RD_PORT || '6379')
    }
});

import { withFilter } from 'apollo-server';
import { IArgID, IArgAddTask, IContext, Task } from './resolver_interfaces.js';

//subscription task
const SUB_UPDATE_TASK = 'SUB_UPDATE_TASK';
const SUB_DELETE_TASK = 'SUB_DELETE_TASK';

const ADD = 1;
const UPDATE = 3;

export default{
    allowedTaskAction: {
        CREATE: ADD,
        ISDONE: UPDATE,
    },

    Query: {
        //tasks(listId: ID!): [Task]
        tasks: async (_: undefined, args: IArgAddTask, context: IContext) => {
            try{
                return await context.models.Task.findAll({
                    where: {
                        listId: args.listId,
                    },
                });
            }
            catch(err){
                console.log(err.errors[0].type)
                throw new Error('Error al buscar todas las tareas');
            }
            
        },

        //task(id: ID!): Task
        task: async (_:undefined, args: IArgID, context: IContext) => {
            try{
                return await context.models.Task.findOne({
                    where: {
                        id: args.id,
                    },
                });
            }
            catch(err){
                console.log(err.errors[0].type)
                throw new Error('Error al buscar una tarea');
            }
            
        },
    },


    Mutation: {
        //addTask(listId: ID!, text: String!): Task
        addTask: combineResolvers(
            isAuthenticated,
            async (_, args, {models, auth}) => {
                try{
                    let result = await models.Task.create({
                        listId: args.listId,
                        text: args.text,
                        userId: auth.id,
                    });    
        
                    //publicamos la nueva tarea
                    let datavalues = result.dataValues
                    pubsub.publish(SUB_UPDATE_TASK, { updateSub: { 
                        task: datavalues,
                        action: ADD
                    }});
        
                    return result.dataValues
                }
                catch(err){
                    console.log(err.errors[0].type)
                    throw new Error('Error al añadir una tarea. ' + err.errors[0].message);
                }
            }
        ),


        //deleteTask(id: ID!, inPublicList: Boolean!): String
        deleteTasks: combineResolvers(
            permitedTaskDelete,
            async (_, args, {models}) => {
                try{
                    
                    const result = await models.Task.findOne({
                        where: {
                            id: args.id,
                        }
                    });
                    const number_of_destroy = await models.Task.destroy({
                        where:{
                            id: args.id,
                        }
                    });
                    
                    //publicamos la tarea borrada
                    pubsub.publish(SUB_DELETE_TASK, { deleteSub: { id: args.id, userId: result.userId, inPublicList: args.inPublicList }});
                    return number_of_destroy
                    
                }
                catch(err){
                    console.log(err.errors[0].type)
                    throw new Error(err.errors[0].message);
                }                
            },
        ),
        

        //markDone(id: ID!, done: Boolean!): Boolean
        markDone: combineResolvers(
            isAuthenticated,
            async (_, args, {models}) => {
                try{
                    let result = await models.Task.update(
                        { done: args.done }, 
                        { where:
                            { id: args.id },
                        }
                    );
    
                    let modified_task = await models.Task.findOne({
                        where: {
                            id: args.id,
                        }
                    })
    
                    //publicamos la tarea modificada
                    pubsub.publish(SUB_UPDATE_TASK, { updateSub: { task: modified_task , action: UPDATE }});
                    if(result == 0){
                        return false;
                    }
                    else{
                        return true;
                    }
                }
                catch(err){
                    console.log(err.errors[0].type)
                    throw new Error(err.errors[0].message);
                }
            },
        ),
    },

    Subscription: {
        updateSub: {
            subscribe: () => { 
                return pubsub.asyncIterator([SUB_UPDATE_TASK]) 
            },
        },

        deleteSub:{
            subscribe: withFilter(
                () => { 
                    return pubsub.asyncIterator([SUB_DELETE_TASK]); 
                },
    
                (payload, _, { auth }) => {
                    if( payload.deleteSub.inPublicList == true ){
                        return true
                    }
                    else{
                        if(payload.deleteSub.userId == auth.id){
                            return true;
                        }
                        else{
                            return false;
                        }
                    }               
                }
            )
        },
        
    },

    Task: {
        list: async (parent: Task, _: undefined, context: IContext) => {
            try{
                let result = await context.models.List.findOne({
                    where: {
                        id: parent.listId,
                    }
                })
                return result;
            }
            catch(err){
                console.log(err.errors[0].type)
                throw new Error(err.errors[0].message);
            }
            
        }
    }
};

