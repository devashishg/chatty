import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationGuardService implements CanActivate {
    constructor(private route: Router) {}
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (localStorage.getItem('token') ) {
          if(route.url[0].path !== 'login') {
            return true;
          } else {
            this.route.navigate(['/home']);
            return false;
          }
        } else if(route.url[0].path !== 'login') {
            this.route.navigate(['/login']);
            return false;
        } else {
          return true;
        }
    }
}
