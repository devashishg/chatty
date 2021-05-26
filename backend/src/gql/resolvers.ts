
import { withFilter } from 'graphql-subscriptions';
import { UserService } from '../entity/user/user.service';

import { hashSync } from 'bcryptjs';
import { message_alert } from '../_local';
import { TokenService } from '../utils/jwt';

let x = 1;

const GroupList = [
  {
    _id: x,
    name: 'Group Family'
  },
  {
    _id: x+1,
    name: 'Group Friends'
  },
  {
    _id: x+2,
    name: 'Group School'
  },
  {
    _id: x+3,
    name: 'Group College'
  },
  {
    _id: x+4,
    name: 'Group Family A'
  },
  {
    _id: x+5,
    name: 'Group Friends B'
  },
  {
    _id: x+6,
    name: 'Group School C'
  },
  {
    _id: x+7,
    name: 'Group College D'
  },
  {
    _id: x+8,
    name: 'Group Family E'
  },
  {
    _id: x+9,
    name: 'Group Friends F'
  },
  {
    _id: x+10,
    name: 'Group School G'
  },
  {
    _id: x+11,
    name: 'Group College H'
  },
]

export const resolvers = {
  Query: {
    groups: (_, params,context) => {
      const token = context.req.headers.authorization;
      const user = TokenService.AuthorizeToken(token);
      if(user) {
        const { offset, size } = params.GroupsReq;
        const results = GroupList.slice(offset, offset+size);
        return {
          groups: results,
          offset: offset + results.length,
          size: GroupList.length,
        };
      } else {
        return null;
      }
    }
  },

  Mutation: {
    registerUser: async (parent, param, context, info) => {
      param.user.key = hashSync(param.user.key,10);
      const user  = await UserService.saveUser(param.user);
      return user._id;
    },

    signIn: async (parent, param,context) => {
      const signinData = param.user;
      const user = await UserService.authenticate(signinData);
      return user.token;
    },

    Message: (parent, {message}, {pubsub}) =>{
      pubsub.publish(message_alert, {
        newMessage: message
      });
      return true;
    }
  },

  Subscription: {
    newMessage: {
      subscribe: withFilter (
        (_, __, { pubsub }) => pubsub.asyncIterator(message_alert),
        (payload, variable) => {
          return payload.newMessage.groupId === variable.groupId;
        }
      )
    }
  }

};
