import { Component } from '@angular/core';
import { SubscriptionResult } from 'apollo-angular';
import { Subscription } from 'rxjs';
import Observable from 'zen-observable';
import { MessageService } from './services/message.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'chatty';
  lastPost: any;

  constructor(newPostGQL: MessageService) {
    // this.lastPost = newPostGQL.subscribe();
  }
}
