import { HttpHandler, HttpHeaderResponse, HttpInterceptor, HttpProgressEvent, HttpRequest, HttpResponse, HttpSentEvent, HttpUserEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export class MimicBackendCycleInterceptor implements HttpInterceptor{

  intercept(req: HttpRequest<unknown>, next: HttpHandler):
    Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<unknown> | HttpUserEvent<unknown>> {

    if (req.url.endsWith('rest/Cycle') && (req.method === 'GET')) {
      return new Observable(observer => {
        observer.next(new HttpResponse<Array<unknown>>({body:

          [
            {id: 1, name: 'Test tournament 1', status: false, rule: 0,
              player: {id: 1, nick: 'golfer', sex: false, whs: 38.4}}

          ]

        , status: 200}));
        observer.complete();
      });
    } else if (req.url.endsWith('rest/Cycle') || req.url.endsWith('rest/CycleTournament') ||
               req.url.startsWith('rest/CycleClose') || req.url.startsWith('rest/Cycle/1') ||
               req.url.startsWith('rest/DeleteCycleTournament')) {
      return new Observable (observer => {
        observer.next(new HttpResponse<unknown>({status: 200}));
        observer.complete();
      });
    } else if (req.url.startsWith('rest/CycleTournament') && (req.method === 'GET')) {
      return new Observable(observer => {
        observer.next(new HttpResponse<Array<unknown>>({body:

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
        observer.next(new HttpResponse<Array<unknown>>({body:

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
        observer.next(new HttpResponse<unknown>({body:

          {items: [{
            first_name: 'James',
            last_name: 'Golfer',
            r: [38, 0, 0, 0],
            hcp: 33.8
          }]}

        , status: 200}));
        observer.complete();
      });
    }
    // pass through other requests.
    return next.handle(req);
  }
}
