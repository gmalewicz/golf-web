import { HttpHandler, HttpHeaderResponse, HttpInterceptor, HttpProgressEvent, HttpRequest, HttpResponse, HttpSentEvent, HttpUserEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export class MimicBackendAppInterceptor implements HttpInterceptor{

  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any>> {

    if (req.url.endsWith('rest/Game/1') && (req.method === 'GET')) {
      return new Observable(observer => {
        observer.next(new HttpResponse<Array<any>>({body:

          [
            {id: 1, gameId: 2, stake: 0, gameDate: '2020-04-29T18:00:58.668+0000'}
          ]

        , status: 200}));
        observer.complete();
      });
    }
  }
}
