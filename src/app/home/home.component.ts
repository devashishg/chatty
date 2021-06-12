import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GQLService } from '../services/gql.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  offset: number = 0;
  GroupList = []
  total:number= 0;
  constructor(private authservice: GQLService, private router:Router) { }

  ngOnInit(): void {
    this.authservice.queryGroups({offset: this.offset,size:5}).subscribe(({data}:any)=>{
      const response = data.groups;
      this.GroupList = response.groups;
      this.offset = response.offset;
      this.total = response.size;
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate([`/login`]);
  }

  groupSelection(groupId:any) {
    this.router.navigate([`/home/${groupId}`])
  }

  prev() {
    if(this.offset > 5) {
      this.authservice.queryGroups({offset: this.offset-8,size:5}).subscribe(({data}:any)=>{
        const response = data.groups;
        this.GroupList = response.groups;
        this.offset = response.offset;
      });
    }
  }

  next() {
    if(this.offset < this.total) {
      this.authservice.queryGroups({offset: (this.offset),size:5}).subscribe(({data}:any)=>{
        const response = data.groups;
        this.GroupList = response.groups;
        this.offset = response.offset;
      });
    }
  }
}
