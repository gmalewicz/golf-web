import { Player } from '@/_models/player';
import { AuthenticationService } from '@/_services/authentication.service';
import { HttpService } from '@/_services/http.service';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Injectable()
export class SessionRecoveryInterceptor implements HttpInterceptor {
  private readonly httpService = inject(HttpService);
  private readonly authenticationService = inject(AuthenticationService);
  private readonly router = inject(Router);

  private _checkTokenExpiryErr(error: HttpErrorResponse): boolean {
    // RFC 6750: access token expired — server signals this via
    // 401 + WWW-Authenticate: Bearer error="token_expired"
    const wwwAuth = error.headers?.get('WWW-Authenticate') ?? '';
    return error?.status === 401 && wwwAuth.includes('token_expired');
  }

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (req.url === 'rest/Authenticate' || req.url === 'rest/AddPlayer' || req.url.startsWith('rest/Refresh')
                                        || req.url.startsWith('signin') || req.url.startsWith('rest/GetSocialPlayer')) {
      return next.handle(req);
    } else {
      return next.handle(req).pipe(
        catchError((error) => {
          if (error instanceof HttpErrorResponse && this._checkTokenExpiryErr(error)) {
            const currentPlayer: Player = this.authenticationService.currentPlayerValue;
            return this.httpService.refresh(currentPlayer.id).pipe(
              switchMap(() => next.handle(req)),
              catchError((refreshError) => {
                this.authenticationService.logout();
                this.router.navigate(['/login']).catch(e => console.log(e));
                return throwError(() => refreshError);
              })
            );
          }
          return throwError(() => error);
        })
      );
    }
  }
}
