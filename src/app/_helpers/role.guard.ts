import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService, AlertService } from '@/_services';


@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        private alertService: AlertService
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

      if (!!route.data.role) {
        const routeRole = route.data.role;
        const roles: string = this.authenticationService.playerRole;

        if (roles.includes(routeRole)) {
          return true;
        } else {
          this.alertService.error('Access denied. You do not have role: ' + routeRole, false);
          this.router.navigate(['/home']);
        }
      }
      return false;
    }
}
