import { HttpHandler, HttpHeaderResponse, HttpInterceptor, HttpProgressEvent, HttpRequest, HttpResponse, HttpSentEvent, HttpUserEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export class MimicBackendMpLeaguesInterceptor implements HttpInterceptor{

  intercept(req: HttpRequest<unknown>, next: HttpHandler):
    Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<unknown> | HttpUserEvent<unknown>> {

    if (req.url.endsWith('rest/League') && (req.method === 'GET')) {
      return new Observable(observer => {
        observer.next(new HttpResponse<Array<unknown>>({body:

          [
            {id: 1, name: 'Test league', status: false,
              player: {id: 1, nick: 'golfer', sex: false, whs: 38.4}}

          ]

        , status: 200}));
        observer.complete();
      });
    } else if ((req.url.startsWith('rest/League') && (req.method === 'GET'))||
               (req.url.startsWith('rest/LeagueMatch') && (req.method === 'GET'))||
               (req.url.startsWith('rest/LeaguePlayer'))) {
      return new Observable (observer => {
        observer.next(new HttpResponse<Array<unknown>>({body:

          [
          ]

        , status: 200}));
        observer.complete();
      });
    } else if ((req.url.startsWith('rest/LeagueMatch')) ||
               (req.url.startsWith('rest/League') && req.method === 'DELETE') ||
               (req.url.startsWith('rest/League') && req.method === 'POST') ||
               (req.url.startsWith('rest/LeagueClose'))) {
      return new Observable (observer => {
        observer.next(new HttpResponse<unknown>({status: 200}));
        observer.complete();
      });
    }
    // pass through other requests.
    return next.handle(req);
  }
}
