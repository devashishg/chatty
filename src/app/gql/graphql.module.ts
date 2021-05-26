import { NgModule } from '@angular/core';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { InMemoryCache, split } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';
import { setContext } from '@apollo/client/link/context';


const uri_https = '/graphql'; // <-- add the URL of the GraphQL server here
const uri_ws = `ws://${location.host}/subscriptions`; // <-- add the URL of the GraphQL server here



const provide = {
  provide: APOLLO_OPTIONS,
  useFactory(httpLink: HttpLink) {

    let authObj = '';
    if (localStorage.getItem('token')) {
      authObj = `${localStorage.getItem('token')}`;
    }

    const http_Link = httpLink.create({
      uri: uri_https,
    });

    const authLink = setContext((_, { headers }) => {
      const token = localStorage.getItem('token');
      return {
        headers: {
          ...headers,
          authorization: token ? `${token}` : "",
        }
      }
    });


    const http = authLink.concat(http_Link)

    const ws = new WebSocketLink({
      uri: uri_ws,
      options: {
        reconnect: true,
        connectionParams: {
          authToken: authObj,
        },
      },
    });

    const link = split(
      ({ query }) => {
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
export class GraphQLModule { }
