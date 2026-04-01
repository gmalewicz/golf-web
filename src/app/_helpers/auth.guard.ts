import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService} from '@/_services';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
    private readonly router = inject(Router);
    private readonly authenticationService = inject(AuthenticationService);


    canActivate() {

        const currentPlayer = this.authenticationService.currentPlayerValue;
        if (currentPlayer) {
            // authorised so return true
            return true;
        }
        // not logged in so redirect to login page with the return url
        this.router.navigate(['/login']).catch(error => console.log(error));
        return false;
    }
}
