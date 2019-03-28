import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

import { combineResolvers } from 'graphql-resolvers';
import { isAuthenticated } from './auth_resolver.js';
import { withFilter } from 'apollo-server';

const options = {
    host: '127.0.0.1',
    port: 6379
}

const pubsub = new RedisPubSub({
    publisher: new Redis(options),
    subscriber: new Redis(options)
});

//subscription task
const SUB_UPDATE_TASK = 'SUB_UPDATE_TASK';
const SUB_DELETE_TASK = 'SUB_DELETE_TASK';

const ADD = 1;
const DELETE = 2;
const UPDATE = 3;

export default{
    allowedTaskAction: {
        CREATE: ADD,
        ISDONE: UPDATE,
    },

    Query: {
        //tasks(listId: ID!): [Task]
        tasks: async (parent, args, {models}) => {
            try{
                return await models.Task.findAll({
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
        task: async (parent, args, {models}) => {
            try{
                return await models.Task.findOne({
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
            async (parent, args, {models}) => {
                try{
                    let result = await models.Task.create({
                        listId: args.listId,
                        text: args.text,
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


        //deleteTask(id: [ID!]): String
        deleteTasks: async (parent, args, {models}) => {
            try{
                let result = await models.Task.destroy({
                    where:{
                        id: args.id,
                    }
                });

                //publicamos la tarea borrada
                pubsub.publish(SUB_DELETE_TASK, { deleteSub: { 
                    ids: args.id,
                }});

                return result
            }
            catch(err){
                console.log(err.errors[0].type)
                throw new Error(err.errors[0].message);
            }
            
        },


        //deleteMultipleTasks(id_array: [ID!]!): String
        /*deleteMultipleTasks: async (parent, args, {models}) => {
            try{
                await models.Task.destroy({
                    where:{
                        id: args.id_array,
                    }
                });

                pubsub.publish(SUB_TASK, {taskSub: { task: null , action: DELETE}});
                return "Se han borrado todas las tareas perfectamente"
            }
            catch(err){
                throw new Error("Error al borrar multiples tareas");
            }
        },*/

        //markDone(id: ID!, done: Boolean!): Boolean
        markDone: async (parent, args, {models}) => {
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
            catch{
                console.log(err.errors[0].type)
                throw new Error(err.errors[0].message);
            }
        },
    },

    Subscription: {
        updateSub: {
            subscribe: withFilter(() => pubsub.asyncIterator(SUB_UPDATE_TASK), (payload, variables) => {
                return payload.update.id === variables.id;
            }),
            /*async() => { 
                return pubsub.asyncIterator([SUB_UPDATE_TASK]) 
            },
        },*/

            deleteSub: {
                subscribe: async() => {
                    return pubsub.asyncIterator([SUB_DELETE_TASK])
                }
            }
        },
    },

    Task: {
        list: async (parent, args, { models }) => {
            try{
                let result = await models.List.findOne({
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


