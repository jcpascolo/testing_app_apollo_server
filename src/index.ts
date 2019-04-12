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


const app = express();
app.use(cors());


const authentication = async (reqHeader: any) => {
  let token;

  if (reqHeader.req == undefined) {
    token = reqHeader.connection.context['x-token']
  }
  else {
    token = reqHeader.req.headers['x-token'];
  }

  if (token) {
    try {
      return await jwt.verify(token, environment.jwt_key);
    }
    catch (err) {
      return false
      //throw new AuthenticationError('Usuario no autenticado, por favor loggeese');
    }
  }
  else {
    return false;
    //throw new AuthenticationError('Usuario no autenticado')
  }
}


const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  subscriptions: {
    path: '/subscriptions',
  },
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


const eraseDatabaseOnSync = process.env.ERASE_DB || false;
const createDefaultUser = process.env.DEFAULT_USER || true;

sequelize.sync({ force: eraseDatabaseOnSync })
  .then(async () => {
    if (createDefaultUser) {
      await models.User.findOrCreate({
        where: {
          email: 'test@test.com'
        },
        defaults: { username: 'test', password: 'testpass' }
      });
    }

    httpServer.listen({ port: environment.port }, () => {
      console.log('Apollo Server on http://localhost:' + process.env.PORT + '/graphql');
      console.log(`🚀 Subscriptions ready`);
    });
  })
