import { AlertService, AuthenticationService } from "@/_services";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, catchError, throwError } from "rxjs";

@Injectable()  
export class ErrorInterceptor implements HttpInterceptor {  
  
  constructor(  
    private readonly router: Router,  
    private readonly alertService: AlertService,  
    private readonly authenticationService: AuthenticationService  
  ) {}  
  
  intercept(  
    request: HttpRequest<unknown>,  
    next: HttpHandler  
  ): Observable<HttpEvent<unknown>> {  
  
    return next.handle(request).pipe(  
      catchError((err: HttpErrorResponse) => {  
  
        if (request.url.endsWith('assets/app-config.json')) {  
          return;  
        }  
  
        const errorMessage = this.getErrorMessage(err);  
  
        switch (err.status) {  
  
          case 998:  
            this.authenticationService.logout();  
            this.alertService.error(  
              $localize`:@@errorInterceptor-sessionExpired:Session expired. Please sign on again.`,  
              true  
            );  
            this.router.navigate(['/login']);  
            break;  
  
          case 403:  
            this.alertService.error(  
              $localize`:@@errorInterceptor-accessDenied:Access denied.`,  
              true  
            );  
            this.router.navigate(['']);  
            break;  
  
          case 0:  
          case 404:  
          case 500:  
          case 504:  
            this.alertService.error(  
              $localize`:@@errorInterceptor-notAvailable:Application not available. Try to refresh browser then log out and log in.`,  
              true  
            );  
            this.router.navigate(['']);  
            break;  
  
          case 401:  
            if (err.error?.error === '14' || err.error?.message !== 'Token Expired') {  
              this.alertService.error(errorMessage, true);  
              this.router.navigate(['/login']);  
            } else {  
              this.alertService.error(  
                $localize`:@@errorInterceptor-logOutIn:Please log out and log in.`,  
                true  
              );  
              this.router.navigate(['']);  
            }  
            break;  
  
          default:  
            this.alertService.error(errorMessage, true);  
            this.router.navigate(['']);  
        }  
  
        return throwError(() => new Error(errorMessage));  
      })  
    );  
  }  
  
  private getErrorMessage(err: HttpErrorResponse): string {  
    if (typeof err.error === 'string') {  
      return err.error;  
    }  
    if (err.error?.message) {  
      return err.error.message;  
    }  
    return err.message || `HTTP ${err.status} error`;  
  }  
}  