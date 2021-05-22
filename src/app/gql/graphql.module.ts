import {NgModule} from '@angular/core';
import {APOLLO_OPTIONS} from 'apollo-angular';
import { InMemoryCache, split} from '@apollo/client/core';
import {HttpLink} from 'apollo-angular/http';
import {getMainDefinition} from '@apollo/client/utilities';
import {WebSocketLink} from '@apollo/client/link/ws';

const uri_https = 'http://localhost:4000/graphql'; // <-- add the URL of the GraphQL server here
const uri_ws = 'ws://localhost:4000/subscriptions'; // <-- add the URL of the GraphQL server here


const provide ={
  provide: APOLLO_OPTIONS,
  useFactory(httpLink: HttpLink) {

    const http = httpLink.create({
      uri: uri_https,
    });

    const ws = new WebSocketLink({
      uri: uri_ws,
      options: {
        reconnect: true,
      },
    });

    const link = split(
      ({query}) => {
        const def = getMainDefinition(query);
        return (
          def.kind === 'OperationDefinition' && def.operation === 'subscription'
        );
      },
      ws,
      http,
    );

    return {
      link,
      cache: new InMemoryCache(),
    };
  },
  deps: [HttpLink],
};


@NgModule({
  providers: [
    provide
  ],
})
export class GraphQLModule {}
