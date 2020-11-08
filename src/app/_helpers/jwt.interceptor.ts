import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthenticationService } from '@/_services';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add authorization header with jwt token if available
        // console.log('attempt to set JWT token');
        const currentPlayer = this.authenticationService.currentPlayerValue;
        if (currentPlayer && currentPlayer.token) {
            // console.log('setting JWT token');
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${currentPlayer.token}`
                }
            });
        }

        return next.handle(request);
    }
}
