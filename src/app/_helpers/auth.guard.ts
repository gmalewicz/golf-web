import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthenticationService, AlertService } from '@/_services';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        private alertService: AlertService
    ) {}

    // tslint:disable-next-line: variable-name
    canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) {
        const currentPlayer = this.authenticationService.currentPlayerValue;
        if (currentPlayer) {
            // authorised so return true
            return true;
        }

        this.alertService.error('You are not authorized to view this page', true);
        // not logged in so redirect to login page with the return url
        this.router.navigate(['/login']);
        return false;
    }
}
