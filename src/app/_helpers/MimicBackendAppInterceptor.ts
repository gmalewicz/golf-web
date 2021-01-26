import { HttpHandler, HttpHeaderResponse, HttpInterceptor, HttpProgressEvent, HttpRequest, HttpResponse, HttpSentEvent, HttpUserEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export class MimicBackendAppInterceptor implements HttpInterceptor{

  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any>> {

    if (req.url.endsWith('rest/Holes/1') && (req.method === 'GET')) {
      return new Observable(observer => {
        observer.next(new HttpResponse<Array<any>>({body:

          [
            {par: 4, number: 1, si: 13},
            {par: 4, number: 2, si: 5},
            {par: 4, number: 3, si: 1},
            {par: 3, number: 4, si: 15},
            {par: 5, number: 5, si: 9},
            {par: 4, number: 6, si: 11},
            {par: 3, number: 7, si: 17},
            {par: 5, number: 8, si: 7},
            {par: 4, number: 9, si: 3},
            {par: 4, number: 10, si: 14},
            {par: 5, number: 11, si: 8},
            {par: 3, number: 12, si: 10},
            {par: 4, number: 13, si: 12},
            {par: 4, number: 14, si: 18},
            {par: 4, number: 15, si: 4},
            {par: 3, number: 16, si: 16},
            {par: 5, number: 17, si: 6},
            {par: 4, number: 18, si: 2}
          ]

        , status: 200}));
        observer.complete();
      });
    } else if (req.url.endsWith('rest/Tee/1') && (req.method === 'GET')) {
      return new Observable(observer => {
        observer.next(new HttpResponse<Array<any>>({body:

          [
            {id: 4, tee: 'men red', cr: 66.9, sr: 125, teeType: 0}
          ]

        , status: 200}));
        observer.complete();
      });
    }
    // pass through other requests.
    return next.handle(req);
  }
}
