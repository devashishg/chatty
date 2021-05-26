import { Component } from '@angular/core';
import { SubscriptionResult } from 'apollo-angular';
import { Subscription } from 'rxjs';
import Observable from 'zen-observable';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'chatty';
}
