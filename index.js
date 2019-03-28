//https://knexjs.org/
//docker exec -it postgres psql -U postgres tododb

const express = require('express')
const { ApolloServer, AuthenticationError } = require('apollo-server-express');

import http from 'http';
import schema from './schemas/schemas';
import resolvers from './resolvers/resolvers';
import models, { sequelize } from './models/models';
import jwt from 'jsonwebtoken';


const app = express();

const JWT_KEY = 'supersecret123';
const EXPIRE_TOKEN = "7d";

const authentication = async (reqHeader) => {
  let token;

  if(reqHeader.req == undefined) {
    token = reqHeader.connection.context['x-token']
  }
  else {
    token = reqHeader.req.headers['x-token'];
  }
  
  if(token){
    try{
      return await jwt.verify(token, JWT_KEY);
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
  context: async (reqHeader) => {
    return {
      models,
      JWT_KEY,
      EXPIRE_TOKEN,
      auth: await authentication(reqHeader),
    }
  }, 
});
server.applyMiddleware({ app });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

sequelize.sync()
.then( async () => {

  httpServer.listen({ port: 4000 }, () => {
    console.log('🚀 Apollo Server on http://localhost:4000/graphql');
  });

})

