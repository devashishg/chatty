import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { GQLService } from '../services/gql.service'
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginform: FormGroup;
  signupForm: FormGroup;

  constructor(public fb: FormBuilder, private authService:GQLService, private router: Router) {
    this.loginform = this.fb.group({
      email: new FormControl('', [Validators.email, Validators.required]),
      key: new FormControl('', [Validators.required]),
    });
    this.signupForm = this.fb.group({
      email: new FormControl('', [Validators.email, Validators.required]),
      name: new FormControl('', [Validators.required]),
      key: new FormControl('', [Validators.required]),
      cnfpwd: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void { }

  submitRegister() {
    this.signupForm.markAllAsTouched();
    if (this.signupForm.valid) {
      const {name, email,key} = this.signupForm.value;
      this.authService.registerUser({name, email,key}).subscribe(data=>{
        this.signupForm.reset();
      },(error)=>{
        this.signupForm.reset();
        this.signupForm.get('email')?.markAsTouched();
        return;
      })
    }
  }

  login() {
    this.loginform.markAllAsTouched();
    if (this.loginform.valid) {
      const { email, key} = this.loginform.value;
      this.authService.login({email,key}).subscribe(({data,error}:any)=>{
        if(error) {
          return;
        }
        localStorage.setItem('token',data.signIn);
        this.router.navigate(['/home']);
      },(error)=>{
        this.loginform.reset();
        this.loginform.markAllAsTouched();
        return;
      });
    }
  }

}
