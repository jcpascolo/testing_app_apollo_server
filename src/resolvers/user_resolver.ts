import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { IContext, IArgLogUser, IArgAddUser, IArgID } from './resolver_interfaces';


//subscription task
const SUB_UPDATE_USER = 'SUB_UPDATE_USER';
const SUB_DELETE_USER = 'SUB_DELETE_USER';

const ADD = 1;
const DELETE = 2;
const UPDATE = 3;



export default {
    
    Query: {
        //users: [User]
        users: async (parent: undefined, args: undefined, context: IContext) => {
            try{
                return await context.models.User.findAll();
            }
            catch(err){
                console.log(err.errors[0].type)
                throw new Error('Error al buscar todos los usuarios');
            }            
        },

        //user(id: ID!): User
        user: async (parent: undefined, args: IArgID, context: IContext) => {
            try{
                let result = await context.models.User.findOne({
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
        addUser: async (parent: undefined, args: IArgAddUser, context: IContext) => {
            try{
                let result = await context.models.User.create({
                    username: args.username,
                    email: args.email,
                    password: args.password, //recordar que en el model, antes de meterlo en la BD se hace el bcrypt con las password
                });    
    
                const { id, username, email } = result
                console.log("EXPIRED IN: ")
                console.log(context.EXPIRE_TOKEN)
                return {username: username,
                        token: jwt.sign(
                            { id, email }, 
                            context.JWT_KEY, 
                            { expiresIn: context.EXPIRE_TOKEN }
                        )};
            }
            catch(err){
                console.log(err)
                throw new Error('Error al añadir un usuario. ' + err);
            }
            
        },

        //logIn(email: String!, password: String!): Token!
        logIn: async (parent: undefined, args: IArgLogUser, context: IContext) => {
            try{
                let registered = await context.models.User.findOne({
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
                                context.JWT_KEY, 
                                { expiresIn: context.EXPIRE_TOKEN }
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