import { Player } from '@/_models/player';
import { AuthenticationService } from '@/_services/authentication.service';
import { HttpService } from '@/_services/http.service';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Injectable()
export class SessionRecoveryInterceptor implements HttpInterceptor {

  constructor(private httpService: HttpService,
              private authenticationService: AuthenticationService,
              private router: Router) {}

  private refreshSubject: Subject<unknown> = new Subject<unknown>();

  private _ifTokenExpired() {
    this.refreshSubject.subscribe({
      complete: () => {
        this.refreshSubject = new Subject<unknown>();
      },
      error: () => {
        this.refreshSubject.complete();
        this.refreshSubject = new Subject<unknown>();
        this.authenticationService.logout();
        this.router.navigate(['/login']).catch(error => console.log(error));
      }
    });
    if (this.refreshSubject.observed) {

      const currentPlayer: Player = this.authenticationService.currentPlayerValue;

      this.httpService.refresh(currentPlayer.id).subscribe(this.refreshSubject);

    }
    return this.refreshSubject;
  }

  private _checkTokenExpiryErr(error: HttpErrorResponse): boolean {

    return (
      (error?.status === 999) ||
      (error?.error && error.error?.status === 999)
    );
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
        catchError((error, caught) => {
          if (error instanceof HttpErrorResponse) {
            if (this._checkTokenExpiryErr(error)) {
              return this._ifTokenExpired().pipe(
                switchMap(() => {
                  return next.handle(req);
                })
              );
            } else {
              return throwError(() => error);
            }
          }
          return caught;
        })
      );
    }
  }
}
