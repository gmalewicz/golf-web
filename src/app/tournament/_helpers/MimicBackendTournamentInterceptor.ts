import { HttpHandler, HttpHeaderResponse, HttpInterceptor, HttpProgressEvent, HttpRequest, HttpResponse, HttpSentEvent, HttpUserEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export class MimicBackendTournamentInterceptor implements HttpInterceptor{

  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any>> {

    if (req.url.endsWith('rest/Tournament') && (req.method === 'GET')) {
      return new Observable(observer => {
        observer.next(new HttpResponse<Array<any>>({body:

          [
            {id: 1, name: 'Elkner Cup', startDate: '2020/06/10', endDate: '2020/06/15',
              player: {id: 1, nick: 'Greg', whs: 28.7, role: 0, captcha: null}},
            {id: 2, name: 'Gosia vs Greg', startDate: '2020/06/26', endDate: '2020/06/29',
              player: {id: 1, nick: 'Greg', whs: 28.7, role: 0, captcha: null}},
            {id: 3, name: 'Gosia vs Greg 2', startDate: '2020/07/04', endDate: '2020/07/11',
              player: {id: 1, nick: 'Greg', whs: 28.7, role: 0, captcha: null}},
            {id: 4, name: 'North Cup', startDate: '2020/07/17', endDate: '2020/07/20',
              player: {id: 1, nick: 'Greg', whs: 28.7, role: 0, captcha: null}},
            {id: 5, name: 'Gosia vs Greg 3', startDate: '2020/08/21', endDate: '2020/09/03',
              player: {id: 1, nick: 'Greg', whs: 28.7, role: 0, captcha: null}},
            {id: 6, name: 'Turniej Mikołajkowy 2020', startDate: '2020/12/06', endDate: '2020/12/07',
              player: {id: 11, nick: 'Gosia', whs: 35.0, role: 1, captcha: null}}
          ]

        , status: 200}));
        observer.complete();
      });
    } else if (req.url.endsWith('rest/TournamentResult/1')) {
        return new Observable<any> (observer => {
          observer.next(new HttpResponse<Array<any>>({body:
            []
          , status: 200}));
          observer.complete();
        });
    }
    // pass through other requests.
    return next.handle(req);
  }
}
