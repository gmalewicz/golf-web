import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpEventType } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthenticationService } from '@/_services';
import { Player } from '@/_models';

@Injectable()
export class PlayerDataInterceptor implements HttpInterceptor {
  constructor(private readonly authenticationService: AuthenticationService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    if ((request.url.startsWith('rest/Rounds') ||
        request.url === 'rest/OnlineRound' ||
        request.url === 'rest/Tournament' ||
        request.url === 'rest/League' ||
        request.url === 'rest/Cycle') &&
        request.method === 'GET') {

      return next.handle(request).pipe(
        tap((httpEvent: HttpEvent<unknown>) =>{
          if (httpEvent.type === HttpEventType.Response) {
            const currentPlayer: Player = this.authenticationService.currentPlayerValue;
            currentPlayer.whs = +httpEvent.headers.get("hcp");
            currentPlayer.sex = JSON.parse(httpEvent.headers.get("sex"));
            this.authenticationService.updateStorage();
          }
        })
      )
    }

    return next.handle(request);
  }
}


