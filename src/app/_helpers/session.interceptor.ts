import { Player } from '@/_models/player';
import { AuthenticationService } from '@/_services/authentication.service';
import { HttpService } from '@/_services/http.service';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse, HttpXsrfTokenExtractor } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

@Injectable()
export class SessionRecoveryInterceptor implements HttpInterceptor {

  constructor(private httpService: HttpService,
              private authenticationService: AuthenticationService,
              private tokenExtractor: HttpXsrfTokenExtractor,
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
        this.router.navigate(['']).catch(error => console.log(error));
      }
    });
    if (this.refreshSubject.observed) {

      const currentPlayer: Player = this.authenticationService.currentPlayerValue;
      // Hit refresh-token API passing the refresh token stored into the request
      // to get new access token and refresh token pair

      this.httpService.refresh(currentPlayer.id).pipe(
        tap(
          (response: HttpResponse<unknown>) => {
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
                  return next.handle(this.updateHeader(req));
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

  private updateHeader(request: HttpRequest<unknown>): HttpRequest<unknown> {

    const currentPlayer: Player = this.authenticationService.currentPlayerValue;

    if (currentPlayer?.token) {
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
