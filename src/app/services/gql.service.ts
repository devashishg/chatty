import { Injectable } from '@angular/core';
import { gql, Apollo } from 'apollo-angular';

export interface Message {
  message: String;
  user: String;
  groupId: String;
}


export interface LoginData {
  email: String;
  key: String;
}

export interface GroupQuery {
  offset: Number;
  size: Number;
}

export interface NewUser extends LoginData {
  name: String;
}

function getDocumentNode({ name, key, email }: NewUser) {
  return gql`
  mutation{
    registerUser (user:{
      name: "${name}"
      key: "${key}"
      email: "${email}"
    })
  }`;
}

function getLoginObject({ key, email }: LoginData) {
  return gql`
  mutation {
    signIn(user:{
      key: "${key}"
      email: "${email}"
    })
  }`;
}

function getpaginatedGroups({ offset, size }: GroupQuery) {
  return gql`
  query {
    groups(GroupsReq: {offset:${offset},size:${size}}){
      groups{
        name
        _id
      }
      offset
      size
    }
  }`;
}

function messageGql({groupId,message,user}:Message) {
  return gql`mutation{
    Message(
      message:{
        groupId: "${groupId}"
        user: "${user}"
        message: "${message}"
        ts: 12132
      })
  }`;
}

function messageSubscription(groupId: String) {
  return gql`
  subscription{
  newMessage(groupId: "${groupId}"){
    message
    user
    ts
  }
}
  `;
}


@Injectable({
  providedIn: 'root'
})
export class GQLService {
  constructor(private apollo: Apollo) { }

  login(user: LoginData) {
    return this.apollo.mutate({ mutation: getLoginObject(user) });
  }

  registerUser(user: NewUser) {
    return this.apollo.mutate({ mutation: getDocumentNode(user) });
  }

  queryGroups({offset,size}: GroupQuery) {
    return this.apollo.query({query: getpaginatedGroups({offset,size})});
  }

  sendMessage(message:Message) {
    return this.apollo.mutate({mutation: messageGql(message)});
  }

  messageSubscription(groupId: String) {
    return this.apollo.subscribe({query:messageSubscription(groupId)});
  }
}
