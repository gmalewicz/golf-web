import { Player } from '@/_models/player';
import { AuthenticationService } from '@/_services/authentication.service';
import { HttpService } from '@/_services/http.service';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse, HttpXsrfTokenExtractor } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { switchMap } from 'rxjs/operators';
import { tap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Injectable()
export class SessionRecoveryInterceptor implements HttpInterceptor {

  constructor(private httpService: HttpService,
              private authenticationService: AuthenticationService,
              private tokenExtractor: HttpXsrfTokenExtractor,
              private router: Router) {}

  private refreshSubject: Subject<any> = new Subject<any>();

  private _ifTokenExpired() {
    this.refreshSubject.subscribe({
      complete: () => {
        this.refreshSubject = new Subject<any>();
      },
      error: () => {
        this.refreshSubject.complete();
        this.refreshSubject = new Subject<any>();
        this.authenticationService.logout();
        this.router.navigate(['']);
      }
    });
    if (this.refreshSubject.observers.length === 1) {

      const currentPlayer: Player = this.authenticationService.currentPlayerValue;
      // Hit refresh-token API passing the refresh token stored into the request
      // to get new access token and refresh token pair

      this.httpService.refresh(currentPlayer.id).pipe(
        tap(
          (response: HttpResponse<any>) => {
            currentPlayer.token =  response.headers.get('Jwt');
            currentPlayer.refreshToken =  response.headers.get('Refresh');
            localStorage.setItem('currentPlayer', JSON.stringify(currentPlayer));
          })
      ).subscribe(this.refreshSubject);

    }
    return this.refreshSubject;
  }

  private _checkTokenExpiryErr(error: HttpErrorResponse): boolean {
    return (
      error.status &&
      error.status === 401 &&
      error.error &&
      error.error.message === 'Token Expired'
    );
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (req.url === 'rest/Authenticate' || req.url === 'rest/AddPlayer' || req.url.startsWith('rest/Refresh')) {
      return next.handle(req);
    } else {
      return next.handle(req).pipe(
        catchError((error, caught) => {
          if (error instanceof HttpErrorResponse) {
            if (this._checkTokenExpiryErr(error)) {
              return this._ifTokenExpired().pipe(
                switchMap(() => {
                  return next.handle(this.updateHeader(req));
                })
              );
            } else {
              return throwError(error);
            }
          }
          return caught;
        })
      );
    }
  }

  updateHeader(request: HttpRequest<any>): HttpRequest<any> {

    const currentPlayer: Player = this.authenticationService.currentPlayerValue;

    if (currentPlayer && currentPlayer.token) {
      request = request.clone({
          setHeaders: {
              Authorization: `Bearer ${currentPlayer.token}`,
              'X-XSRF-TOKEN': this.tokenExtractor.getToken()
          }
      });
      return request;
    }
  }
}
