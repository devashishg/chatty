
import { withFilter } from 'graphql-subscriptions';
import { userModel as user } from '../entity/user/user.model';
import { message_alert } from '../_local';

let x = 1;

export const resolvers = {
  Query: {
    hello: (_, __, { pubsub }) => {
      pubsub.publish(message_alert, {
        newMessage: x
      });
      return `hi${x++}`;
    },

    groups: (_, params) => {
      const { offset, size } = params.GroupsReq;
      const groups = [{
        _id: x,
        name: 'GroupA'
      }];
      return {
        groups,
        offset: offset + groups.length,
        size: groups.length,
      };
    }
  },

  Mutation: {
    registerUser: (parent, param, context, info) => {
      return param.user.name;
    },

    signIn: (parent, param) => {
      const signinData = param.user;
      console.log(signinData);
      return true;
    }
  },

  Subscription: {
    newMessage: {
      subscribe: withFilter(
        (_, __, { pubsub }) => pubsub.asyncIterator(message_alert),
        (payload, variable) => {
          console.log(payload);
          console.log(variable);
          return true;
        }
      )
    }
  }

};
