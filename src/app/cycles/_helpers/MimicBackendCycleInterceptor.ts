import { HttpHandler, HttpHeaderResponse, HttpInterceptor, HttpProgressEvent, HttpRequest, HttpResponse, HttpSentEvent, HttpUserEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export class MimicBackendCycleInterceptor implements HttpInterceptor{

  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any>> {

    if (req.url.endsWith('rest/Cycle') && (req.method === 'GET')) {
      return new Observable(observer => {
        observer.next(new HttpResponse<Array<any>>({body:

          [
            {id: 1, name: 'Test tournament 1', status: false, rule: 0,
              player: {id: 1, nick: 'golfer', sex: false, whs: 38.4}}

          ]

        , status: 200}));
        observer.complete();
      });
    } else if (req.url.endsWith('rest/Cycle')) {
      return new Observable<any> (observer => {
      observer.next(new HttpResponse<any>({status: 200}));
      observer.complete();
      });
    } else if (req.url.startsWith('rest/CycleTournament') && (req.method === 'GET')) {
      return new Observable(observer => {
        observer.next(new HttpResponse<Array<any>>({body:

          [{
            cycle: {id: 2, name: 'Volvo 2021', status: false, player: {id: 1, nick: 'golfer', sex: false, whs: 38.4}},
            id: 20,
            name: 'Sobienie Królewskie',
            rounds: 1
          }]

        , status: 200}));
        observer.complete();
      });
    } else if (req.url.startsWith('rest/CycleResult') && (req.method === 'GET')) {
      return new Observable(observer => {
        observer.next(new HttpResponse<Array<any>>({body:

          [{
            cycleResult: 124,
            name: 'Golfer James',
            r: [38, 0, 0, 0, 42, 0, 0, 0, 29, 0, 0, 0, 44, 25, 0, 0],
            total: 178
          }]

        , status: 200}));
        observer.complete();
      });
    } else if (req.url.startsWith('api') && (req.method === 'GET')) {

      return new Observable(observer => {
        observer.next(new HttpResponse<any>({body:

          {items: [{
            first_name: 'James',
            last_name: 'Golfer',
            r: [38, 0, 0, 0],
            hcp: 33.8
          }]}

        , status: 200}));
        observer.complete();
      });
    } else if (req.url.endsWith('rest/CycleTournament')) {
      return new Observable<any> (observer => {
      observer.next(new HttpResponse<any>({status: 200}));
      observer.complete();
      });
    }
    // pass through other requests.
    return next.handle(req);
  }
}
