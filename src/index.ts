//https://knexjs.org/
//docker exec -it postgres psql -U postgres tododb
////"start": "nodemon --exec babel-node --extensions \".js, .ts\" src/index.ts",

const express = require('express')
const { ApolloServer } = require('apollo-server-express');
import { environment } from './environment'

import http from 'http';
import schema from './schemas/schemas';
import resolvers from './resolvers/resolvers';
import models, { sequelize } from './models/models';
import jwt from 'jsonwebtoken';

console.log(process.env.PORT)
console.log(process.env.DB_USER)
console.log(process.env.DB_HOST)
  console.log(process.env.DB_USER)
    console.log(process.env.DB_PASS)
      console.log(process.env.DB_NAME)
        console.log(process.env.DB_PORT)
          console.log(process.env.RD_HOST)
            console.log(process.env.RD_PORT)
              console.log(process.env.PORT)
                console.log(process.env.JWT_KEY)
                  console.log(process.env.EXPIRE_TOKEN)


const app = express();

const authentication = async (reqHeader: any) => {
  let token;

  if(reqHeader.req == undefined) {
    token = reqHeader.connection.context['x-token']
  }
  else {
    token = reqHeader.req.headers['x-token'];
  }
  
  if(token){
    try{
      return await jwt.verify(token, environment.jwt_key);
    }
    catch(err){
      return false
      //throw new AuthenticationError('Usuario no autenticado, por favor loggeese');
    }
  }
  else{
    return false;
    //throw new AuthenticationError('Usuario no autenticado')
  }
}

const server = new ApolloServer({ 
  typeDefs: schema,
  resolvers,
  context: async (reqHeader: any) => {
    return {
      models,
      jwt_key: environment.jwt_key,
      expire_token: environment.expire_token,
      auth: await authentication(reqHeader),
    }
  }, 
});
server.applyMiddleware({ app });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

sequelize.sync()
.then( async () => {

  httpServer.listen({ port: environment.port }, () => {
    console.log('Apollo Server on http://localhost:4000/graphql');
  });

})





// Hot Module Replacement
if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => console.log('Module disposed. '));
}