import { Injectable } from '@angular/core';
import {Subscription, gql} from 'apollo-angular';

@Injectable({
  providedIn: 'root'
})
export class MessageService extends Subscription{
  document = gql`
    subscription {
      newMessage(groupId:"123")
    }`;
}
