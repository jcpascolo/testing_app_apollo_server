//https://knexjs.org/
//docker exec -it postgres psql -U postgres tododb

require('dotenv/config');
const express = require('express')
const { ApolloServer } = require('apollo-server-express');
import { environment } from './environment'

import http from 'http';
import schema from './schemas/schemas';
import resolvers from './resolvers/resolvers';
import models, { sequelize } from './models/models';
import jwt from 'jsonwebtoken';


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

console.log("pepito")

const server = new ApolloServer({ 
  typeDefs: schema,
  resolvers,
  context: async (reqHeader: any) => {
    return {
      models,
      JWT_KEY: environment.jwt_key,
      EXPIRE_TOKEN: environment.expire_token,
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