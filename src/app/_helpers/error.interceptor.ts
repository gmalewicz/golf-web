import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthenticationService } from '@/_services';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService, private router: Router) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            console.log('error intercepted');
            console.log('player: ' + this.authenticationService.currentPlayerValue.nick);
            if (err.status === 401 || this.authenticationService.currentPlayerValue === null) {
              this.authenticationService.logout();
              this.router.navigate(['/login']);
            }

            const error = err.error.message || err.statusText;
            // console.log(err.error.message);
            // console.log(err.statusText);
            return throwError(err);
        }));
    }
}
