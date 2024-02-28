import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AlertService } from '@/_services';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router,
              private alertService: AlertService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(catchError((err: HttpErrorResponse) => {

      if (request.url.endsWith('assets/app-config.json')) {
        return;
      }

      if (err.status === 403) {
        this.alertService.error($localize`:@@errorInterceptor-accessDenied:Access denied.`, true);
        this.router.navigate(['']).catch(error => console.log(error));
        return throwError(() => new Error(err.statusText.toString()));
      }

      if (err.status === 0 || err.status === 404 || err.status === 504) {
        this.alertService.error($localize`:@@errorInterceptor-notAvailable:Application not available. Try to refresh browser then log out and log in.`, true);
        this.router.navigate(['']).catch(error => console.log(error));
        return throwError(() => new Error(err.statusText.toString()));
      }

      if (err.status !== 401) {
        this.alertService.error(err.error.message, true);
        this.router.navigate(['']).catch(error => console.log(error));
        return throwError(() => new Error(err.statusText.toString()));
      }

      if ((err.status === 401 && err.error !== undefined && err.error.error === '14') ||
        (err.status === 401 && err.error.message !== 'Token Expired')) {
        this.alertService.error(err.error.message, true);
        this.router.navigate(['/login']).catch(error => console.log(error));
        return throwError(() => new Error(err.statusText.toString()));
      }

      if (err.status === 401) {
        this.alertService.error($localize`:@@errorInterceptor-logOutIn:Please log out and log in.`, true);
        this.router.navigate(['']).catch(error => console.log(error));
        return throwError(() => new Error(err.statusText.toString()));
      }
    }));
  }
}
