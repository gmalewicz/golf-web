import { HttpHandler, HttpHeaderResponse, HttpInterceptor, HttpProgressEvent, HttpRequest, HttpResponse, HttpSentEvent, HttpUserEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export class MimicBackendTournamentInterceptor implements HttpInterceptor{

  intercept(req: HttpRequest<unknown>, next: HttpHandler):
    Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<unknown> | HttpUserEvent<unknown>> {

    if (req.url.endsWith('rest/Tournament') && (req.method === 'GET')) {
      return new Observable(observer => {
        observer.next(new HttpResponse<Array<unknown>>({body:

          [
            {id: 1, name: 'Elkner Cup', startDate: '2020/06/10', endDate: '2020/06/15', bestRounds: 0,
              player: {id: 1, nick: 'Greg', whs: 28.7, role: 0, captcha: null}},
            {id: 2, name: 'Gosia vs Greg', startDate: '2020/06/26', endDate: '2020/06/29', bestRounds: 0,
              player: {id: 1, nick: 'Greg', whs: 28.7, role: 0, captcha: null}},
            {id: 3, name: 'Gosia vs Greg 2', startDate: '2020/07/04', endDate: '2020/07/11', bestRounds: 0,
              player: {id: 1, nick: 'Greg', whs: 28.7, role: 0, captcha: null}},
            {id: 4, name: 'North Cup', startDate: '2020/07/17', endDate: '2020/07/20', bestRounds: 0,
              player: {id: 1, nick: 'Greg', whs: 28.7, role: 0, captcha: null}},
            {id: 5, name: 'Gosia vs Greg 3', startDate: '2020/08/21', endDate: '2020/09/03', bestRounds: 0,
              player: {id: 1, nick: 'Greg', whs: 28.7, role: 0, captcha: null}},
            {id: 6, name: 'Turniej Mikołajkowy 2020', startDate: '2020/12/06', endDate: '2020/12/07', bestRounds: 0,
              player: {id: 11, nick: 'Gosia', whs: 35.0, role: 1, captcha: null}}
          ]

        , status: 200}));
        observer.complete();
      });
    } else if (req.url.endsWith('rest/TournamentResult/1') ||
               req.url.startsWith('rest/TournamentResultRound') ||
               req.url.startsWith('rest/TournamentRound') ||
               req.url.startsWith('rest/Round') ||
               req.url.startsWith('rest/TournamentRoundOnBehalf') ||
               req.url.startsWith('rest/TournamentClose') ||
               req.url.startsWith('rest/Tournament') ||
               req.url.startsWith('rest/TournamentPlayer')) {
        return new Observable (observer => {
          observer.next(new HttpResponse<Array<unknown>>({body:
            []
          , status: 200}));
          observer.complete();
        });
    }
    // pass through other requests
    return next.handle(req);
  }
}
