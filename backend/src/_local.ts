import * as createError from 'http-errors';
import * as express from 'express';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as http from 'http';

import { router as userController } from './entity/user/user.controller';

import { ApolloServer, PubSub } from 'apollo-server-express';
import { typeDefs } from './gql/typedef';
import { resolvers } from './gql/resolvers';
import { TokenService } from './utils/jwt';
const debug = require('debug')('express:server');


export const message_alert = '0';

const port = process.env.NODE_ENV === 'production' ? process.env.PORT || 80 : 3000;;

dotenv.config();

export const app = express();

app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');

app.use('/user', userController);


const pubsub = new PubSub();
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => ({ req, res, pubsub }),
  subscriptions: {
    path: '/subscriptions',
    onConnect: (connectionParams, webSocket, context) => {
      const test = TokenService.AuthorizeToken(connectionParams['authToken']);
      if(test) {
        console.log('Client connected');
      } else {
        console.log('Client connection closing!');
        webSocket.close(401,'Invalid user');
      }
    },
    onDisconnect: (webSocket, context) => {
      console.log('Client disconnected');
    },
  },
});


const httpServer = http.createServer(app);

apolloServer.applyMiddleware({ app });

app.use('/',express.static(path.join(__dirname,'../', 'public','chatty'))); 9

apolloServer.installSubscriptionHandlers(httpServer);

httpServer.listen(port).on('listening', onListening).on('error', onError);


function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  let bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
    default:
      throw error;
  }
}

function onListening() {
  debug('Listening on ' + port);
  console.log('Listening on ' + port);
  console.log(`Server listening on http://localhost:${port}${apolloServer.graphqlPath}`);
}


app.use(function (req, res, next) {
  next(createError(404));
});


app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  console.log(err);

  res.render('error');
});


