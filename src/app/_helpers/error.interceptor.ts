import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AlertService } from '@/_services';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router,
              private alertService: AlertService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(err => {

      if (err.status === 504) {
        err.error = { message: 'Server unavailable' };
      }

      if (err.status === 0 || err.status === 404) {
        this.alertService.error($localize`:@@errorInterceptor-notAvailable:Application not available. Try to refresh browser then log out and log in.`, true);
        this.router.navigate(['']);
        return throwError(() => new Error(err.status));
      }

      if (err.status !== 401) {
        this.alertService.error(err.error.message, true);
        this.router.navigate(['']);
        return throwError(() => new Error(err.status));
      }

      if (err.status === 401 && err.error !== undefined && err.error.error === '14') {
        this.alertService.error(err.error.message, true);
        this.router.navigate(['']);
        return throwError(() => new Error(err.status));
      }

      if (err.status === 401 && err.error.message !== 'Token Expired') {
        this.alertService.error(err.error.message, true);
        this.router.navigate(['']);
        return throwError(() => new Error(err.status));
      }

      if (err.status === 401) {
        this.alertService.error($localize`:@@errorInterceptor-logOutIn:Please log out and log in.`, true);
        this.router.navigate(['']);
        return throwError(() => new Error(err.status));
      }

    }));
  }
}
