import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

import { combineResolvers } from 'graphql-resolvers';
import { isListOwner, isAuthenticated } from './auth_resolver.js';

const options = {
    host: '127.0.0.1',
    port: 6379
}

const pubsub = new RedisPubSub({
    publisher: new Redis(options),
    subscriber: new Redis(options)
});

//subscription list
const SUB_LIST = 'SUB_LIST';

const ADD = 1;
const DELETE = 2;

import Sequelize from 'sequelize';
import { withFilter } from 'apollo-server';
const Op = Sequelize.Op;

export default{
    allowedListAction: {
        CREATE: ADD,
        DESTROY: DELETE,
    },

    Query: {
        //lists: [List]  => return all lists
        lists: async (parent, args, { models, auth }) => {
            try{
                let result = [];
                if(auth){
                    result = await models.List.findAll({
                        where: {
                            [Op.or]: [{public: true}, {userId: auth.id}],
                        }
                    });
                }
                else{
                    result = await models.List.findAll({
                        where: {
                            public: true,
                        }
                    });
                }
                return result
            }
            catch(err){
                throw new Error("Error al listar todas las listas" + err.message)
            }
            
        },

        //list(id: ID!): List  => return the data of a specific list
        list: async (parent, args, { models }) => {
            try{
                return await models.List.findOne({
                    where: {
                        id: args.id,
                    },
                });
            }
            catch(err){
                throw new Error("Error al listar una lista concreto");
            }
            ;
        },
    },

    Mutation: {
        //addList(name: String!, public: Boolean!): List!
        addList: combineResolvers(
            isAuthenticated,
            async (parent, args, { models, auth }) => {
                try{
                    let {dataValues, ...rest} = await models.List.create({
                        name: args.name,
                        public: args.public,
                        userId: auth.id,
                    });
                    
                    pubsub.publish(SUB_LIST, { listSub: {list: dataValues, action: ADD}})
                    return dataValues
                }
                catch(err){
                    throw new Error("Error al crear una lista");
                }            
            },
        ),

        //deleteList(id: ID!): String!
        deleteList: combineResolvers(
            isListOwner,
            async (parent, args, { models, auth }) => {
                try{
                    
                    await models.List.destroy({
                        where: {
                            id: args.id,
                        }
                    })
                    pubsub.publish(SUB_LIST, { listSub: {list: {id: args.id, name: "" }, action: DELETE}})
                    return "The List has been destroyed successfuly";
                }
                catch(err){
                    throw new Error("Error al borrar la lista");
                }
                
            },
        )
        
    },

    Subscription: {
        listSub: {
            subscribe: withFilter(
                () => { 
                    return pubsub.asyncIterator([SUB_LIST]); 
                },

                (payload, args, { auth }) => {
                    console.log("En la subscripcion")
                    console.log(auth)
                    if((payload.listSub.list.userId == auth.id) || (payload.listSub.list.public == true)){
                        return true
                    }
                    else{
                        return false
                    }
                    
                }
            )
        }
    },

    List: {
        tasks: async (parent, arg, {models}) => {
            try{
                let result = await models.Task.findAll({
                    where: {
                        listId: parent.id,
                    }
                })
                return result
            }
            catch(err){
                throw new Error("No se han podido cargar las tareas de la lista")
            }
            
        }
    }
};






/*
export default {    
    Query: {
        todo: async () => {
            //return new Promise((resolve, reject) => {
            //client.query('SELECT * FROM task').then((result) => resolve(result.rows))
            //})
    
            const result = await client.query('select * from task');
            console.log(result)
            return result.rows
        },
    },
    
    Mutation: {
        addTask: async (parent, arg) => {
            console.log(arg)
            const result = await client.query(`update task set tasks = array_cat(tasks, '{${arg.task}}') where id=${arg.id}`)
            console.log(result)
            //return result
            return "cachi"
        },
    },
    
    Todo: {
        tareas: (todo) => {
            console.log(todo.tasks)
            return todo.tasks
        }
    },
    
};*/