import { Injectable, inject } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AlertService, AuthenticationService } from '@/_services';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private readonly router = inject(Router);
  private readonly alertService = inject(AlertService);
  private readonly authenticationService = inject(AuthenticationService);


  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(catchError((err: HttpErrorResponse) => {

      if (request.url.endsWith('assets/app-config.json')) {
        return;
      }

      // RFC 6750: 401 + WWW-Authenticate: Bearer error="invalid_token"
      // means both tokens are dead — force re-login
      const wwwAuth = err.headers?.get('WWW-Authenticate') ?? '';
      if (err.status === 401 && wwwAuth.includes('invalid_token')) {
        this.authenticationService.logout();
        this.alertService.error($localize`:@@errorInterceptor-sessionExpired:Session expired. Please sign on again.`, true);
        this.router.navigate(['/login']).catch(error => console.log(error));
        return throwError(() => new Error(String(err.status)));
      }

      // 401 + token_expired is handled by SessionRecoveryInterceptor — skip here
      if (err.status === 401 && wwwAuth.includes('token_expired')) {
        return throwError(() => err);
      }

      if (err.status === 403) {
        this.alertService.error($localize`:@@errorInterceptor-accessDenied:Access denied.`, true);
        this.router.navigate(['']).catch(error => console.log(error));
        return throwError(() => new Error(String(err.status)));
      }

      if (err.status === 0 || err.status === 404 || err.status === 504 || err.status === 500) {
        this.alertService.error($localize`:@@errorInterceptor-notAvailable:Application not available. Try to refresh browser then log out and log in.`, true);
        this.router.navigate(['']).catch(error => console.log(error));
        return throwError(() => new Error(String(err.status)));
      }

      if (err.status !== 401) {
        this.alertService.error(err.error.message, true);
        this.router.navigate(['']).catch(error => console.log(error));
        return throwError(() => new Error(String(err.status)));
      }

      if ((err.status === 401 && err.error !== undefined && err.error.error === '14') ||
        (err.status === 401 && err.error.message !== 'Token Expired')) {
        this.alertService.error(err.error.message, true);
        this.router.navigate(['/login']).catch(error => console.log(error));
        return throwError(() => new Error(String(err.status)));
      }

      if (err.status === 401) {
        this.alertService.error($localize`:@@errorInterceptor-logOutIn:Please log out and log in.`, true);
        this.router.navigate(['']).catch(error => console.log(error));
        return throwError(() => new Error(String(err.status)));
      }
    }));
  }
}