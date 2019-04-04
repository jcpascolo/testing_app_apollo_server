import { RedisPubSub } from 'graphql-redis-subscriptions';

import { combineResolvers } from 'graphql-resolvers';
import { isListOwner, isAuthenticated } from './auth_resolver';

import { IContext, IArgID, List } from './resolver_interfaces';

const pubsub = new RedisPubSub({
    connection:{
        host: process.env.RD_HOST || '127.0.0.1',
        port: parseInt(process.env.RD_PORT || '6379')
    }
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
        lists: async (parent: undefined, args: undefined, context: IContext) => {
            try{
                let result = [];
                if(context.auth){
                    result = await context.models.List.findAll({
                        where: {
                            [Op.or]: [{public: true}, {userId: context.auth.id}],
                        }
                    });
                }
                else{
                    result = await context.models.List.findAll({
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
        list: async (parent: undefined, args: IArgID, context: IContext) => {
            try{
                return await context.models.List.findOne({
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
            async (parent: undefined, args, context: IContext) => {
                try{
                    let {dataValues, ...rest} = await context.models.List.create({
                        name: args.name,
                        public: args.public,
                        userId: context.auth.id,
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
            async (parent: undefined, args, { models, auth }) => {
                try{
                    
                    await models.List.destroy({
                        where: {
                            id: args.id,
                        },
                    });
                    

                    pubsub.publish(SUB_LIST, { listSub: {list: {id: args.id, name: "", userId: auth.id, public: false }, action: DELETE}});

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
        tasks: async (parent: List, arg: undefined, context: IContext) => {
            try{
                let result = await context.models.Task.findAll({
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
