import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { AuthenticationService } from '@/_services';
import { Router } from '@angular/router';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService,
                private router: Router) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add authorization header with jwt token if available
        const currentPlayer = this.authenticationService.currentPlayerValue;

        // skip urls tha does not need security
        if (request.url === 'rest/Authenticate' || request.url === 'rest/AddPlayer') {
          return next.handle(request);
        }

        // add token if exists else throw an error and logout
        if (currentPlayer && currentPlayer.token) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${currentPlayer.token}`
                }
            });

            if (request.url.startsWith('rest/Refresh')) {
              request = request.clone({
                setHeaders: {
                    Refresh: `${currentPlayer.refreshToken}`
                }
              });
            }

        } else {
          this.authenticationService.logout();
          this.router.navigate(['/login']);
          return throwError({error: {message: 'Session expired, pleease log in'}});
        }

        return next.handle(request);
    }
}
