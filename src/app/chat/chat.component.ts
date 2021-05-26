import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { GQLService } from '../services/gql.service';
import jwtDecode, { JwtPayload } from "jwt-decode";

interface Chat {
  message: String,
  user: String,
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  chat:FormControl;
  myChats:Array<Chat> = [];
  groupId = "";
  user = "";
  subscriptionA:any;
  subscriptionB:any;

  constructor(private gql: GQLService,private router: ActivatedRoute) {
    this.chat = new FormControl("");
   }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if ( token ) {
      let payload:any = jwtDecode<JwtPayload>(token);
      this.user = payload.user;
    }
    this.router.params.subscribe((data)=>{
      this.groupId = data.groupId;
      this.subscriptionA = this.gql.messageSubscription(this.groupId).subscribe(({data,error}:any)=>{
        if(error) {
          return;
        }
        this.myChats = [data.newMessage,...this.myChats];
      })
    })
  }

  send(event:any) {
    if(event.type === 'keyup' && event.keyCode !== 13) {
      return;
    }
    if(this.chat.value.trim()) {
      this.subscriptionA = this.gql.sendMessage({user:`${this.user}`,groupId:this.groupId,message:this.chat.value.trim()}).subscribe(({data,error}:any)=>{
        if(error) {
          console.log(error);
          return;
        }
        this.chat.patchValue('');
      })
    }
  }

  ngOnDestroy() {
    this.subscriptionA?.unsubscribe();
    this.subscriptionB?.unsubscribe();
  }

}
