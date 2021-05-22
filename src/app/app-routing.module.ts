import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';

import { AuthenticationGuardService } from './services/guard.service'


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
      path: 'home/:groupId',
      component: ChatComponent,
      canActivate: [AuthenticationGuardService]
  },
  {
      path: 'home',
      component: HomeComponent,
      canActivate: [AuthenticationGuardService]
  },
  {
      path: '**',
      redirectTo: 'login',
      pathMatch: 'full',
      canActivate: [AuthenticationGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
