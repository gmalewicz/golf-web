import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpEventType } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthenticationService } from '@/_services';
import { Player } from '@/_models';

@Injectable()
export class PlayerDataInterceptor implements HttpInterceptor {
  constructor(private authenticationService: AuthenticationService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    if (request.url === 'rest/Authenticate' || request.url === 'rest/AddPlayer' || request.url.startsWith('signin') ||
        request.url.startsWith('rest/GetSocialPlayer')) {
      return next.handle(request);
    }

    return next.handle(request).pipe(
      tap((httpEvent: HttpEvent<unknown>) =>{
        if (httpEvent.type === HttpEventType.Response) {
          const currentPlayer: Player = this.authenticationService.currentPlayerValue;
          currentPlayer.whs = +httpEvent.headers.get("hcp");
          currentPlayer.sex = Boolean(httpEvent.headers.get("sex"));
          this.authenticationService.updateStorage();
        }
      })
    )
  }
}


