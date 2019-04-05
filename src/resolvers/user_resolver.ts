import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt-nodejs';
import { IContext, IArgLogUser, IArgAddUser, IArgID } from './resolver_interfaces';


export default {
    
    Query: {
        //users: [User]
        users: async (_: undefined, __: undefined, context: IContext) => {
            try{
                return await context.models.User.findAll();
            }
            catch(err){
                console.log(err.errors[0].type)
                throw new Error('Error al buscar todos los usuarios');
            }            
        },

        //user(id: ID!): User
        user: async (_: undefined, args: IArgID, context: IContext) => {
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
        addUser: async (_: undefined, args: IArgAddUser, context: IContext) => {
            try{                
                let result = await context.models.User.create({
                    username: args.username,
                    email: args.email,
                    password: args.password, //recordar que en el model, antes de meterlo en la BD se hace el bcrypt con las password
                });    
    
                const { id, username, email } = result
                return {username: username,
                        token: jwt.sign(
                            { id, email }, 
                            context.jwt_key, 
                            { expiresIn: context.expire_token }
                        )};
            }
            catch(err){
                console.log(err)
                throw new Error('Error al añadir un usuario. ' + err);
            }
            
        },

        //logIn(email: String!, password: String!): Token!
        logIn: async (_: undefined, args: IArgLogUser, context: IContext) => {
            try{
                console.log(typeof(context.models.User))
                let registered = await context.models.User.findOne({
                    where: {
                        email: args.email,
                    }
                });

                if(!registered){
                    throw new Error("Fallo al autenticar")
                }
                else{
                    let validPassword
                    await bcrypt.compare(args.password, registered.password, (err, res) =>{
                        if(err){
                            throw new Error("Usuario no valido o password incorrecta")
                        }
                        else{
                            console.log(res)
                            validPassword = res
                        }
                    });

                    if(validPassword){
                        const { id, username, email } = registered

                        return {username: username,
                            token: jwt.sign(
                                { id, email }, 
                                context.jwt_key, 
                                { expiresIn: context.expire_token }
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

    },

};