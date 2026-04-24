import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private tokenStorage: TokenStorageService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user = this.tokenStorage.getUser();
    if (user && user.token) {
      // check if route is restricted by role
      if (route.data['roles'] && !route.data['roles'].some((role: string) => user.roles.includes(role))) {
        // role not authorized so redirect to home page
        this.router.navigate(['/']);
        return false;
      }
      // authorized so return true
      return true;
    }

    // not logged in so redirect to login page with the return url
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
