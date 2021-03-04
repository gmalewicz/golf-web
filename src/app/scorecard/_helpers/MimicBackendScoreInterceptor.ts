import { HttpHandler, HttpHeaderResponse, HttpInterceptor, HttpProgressEvent, HttpRequest, HttpResponse, HttpSentEvent, HttpUserEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export class MimicBackendScoreInterceptor implements HttpInterceptor{

  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any>> {

    if (req.url.endsWith('rest/OnlineRounds')) {
      console.log('here');
      return new Observable<any> (observer => {
        observer.next(new HttpResponse<any>({status: 200}));
        observer.complete();
      });
    }
    // pass through other requests.
    return next.handle(req);
  }
}
