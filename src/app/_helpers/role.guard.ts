import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService, AlertService } from '@/_services';

@Injectable({ providedIn: 'root' })
export class RoleGuard {
    constructor(
        private readonly router: Router,
        private readonly authenticationService: AuthenticationService,
        private readonly alertService: AlertService
    ) {}

    canActivate(routeRole: string): boolean {

      const roles: string = this.authenticationService.playerRole;

      if (roles.includes(routeRole)) {
        return true;
      } else {
        this.alertService.error($localize`:@@roleGuard-accessDenied:Access denied. You do not have role: ${routeRole}.`, false);
        this.router.navigate(['/home']).catch(error => console.log(error));
      }

      return false;
    }
}
