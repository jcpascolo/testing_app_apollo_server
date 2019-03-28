import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const options = {
    host: '127.0.0.1',
    port: 6379
}

const pubsub = new RedisPubSub({

    publisher: new Redis(options),
    subscriber: new Redis(options)

});

//subscription task
const SUB_UPDATE_USER = 'SUB_UPDATE_USER';
const SUB_DELETE_USER = 'SUB_DELETE_USER';

const ADD = 1;
const DELETE = 2;
const UPDATE = 3;



export default {
    
    Query: {
        //users: [User]
        users: async (parent, args, {models}) => {
            try{
                return await models.User.findAll();
            }
            catch(err){
                console.log(err.errors[0].type)
                throw new Error('Error al buscar todos los usuarios');
            }            
        },

        //user(id: ID!): User
        user: async (parent, args, {models}) => {
            try{
                let result = await models.User.findOne({
                    where: {
                        id: args.id
                    }
                });

                return result
            }
            catch(err){
                throw new Error('Error al buscar el usuario')
            }
        },
    },

    Mutation: {
        //addUser(username: String!, email: String!, password: String!): Token!
        addUser: async (parent, args, {models, JWT_KEY, EXPIRE_TOKEN}) => {
            try{
                let result = await models.User.create({
                    username: args.username,
                    email: args.email,
                    password: args.password, //recordar que en el model, antes de meterlo en la BD se hace el bcrypt con las password
                });    
    

                //publicamos el nuevo usuario
                
                
                const { id, username, email } = result
                return {username: username,
                        token: jwt.sign(
                            { id, email }, 
                            JWT_KEY, 
                            { expiresIn: EXPIRE_TOKEN }
                        )};
            }
            catch(err){
                console.log(err.errors[0].type)
                throw new Error('Error al añadir una tarea. ' + err.errors[0].message);
            }
            
        },

        //logIn(email: String!, password: String!): Token!
        logIn: async (parent, args, {models, JWT_KEY, EXPIRE_TOKEN}) => {
            try{
                let registered = await models.User.findOne({
                    where: {
                        email: args.email,
                    }
                });

                if(!registered){
                    throw new Error("Fallo al autenticar")
                }
                else{
                    let validPassword = await bcrypt.compare(args.password, registered.password);

                    if(validPassword){
                        const { id, username, email } = registered

                        return {username: username,
                            token: jwt.sign(
                                { id, email }, 
                                JWT_KEY, 
                                { expiresIn: EXPIRE_TOKEN }
                            )};
                    }
                    else{
                        throw new Error("Fallo al autenticar, contraseña incorrecta")
                    }
                }
            }
            catch(err){
                throw new Error(err);
            }
            
            

            
        },

        //deleteUser(id: ID!): String!
    },


    /*Subscription: {
        userSub: UserResponse
    }*/
};