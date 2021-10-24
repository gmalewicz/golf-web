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
    }
    // pass through other requests.
    return next.handle(req);
  }
}
