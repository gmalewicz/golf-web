import { HttpHandler, HttpHeaderResponse, HttpInterceptor, HttpProgressEvent, HttpRequest, HttpResponse, HttpSentEvent, HttpUserEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getOnlineRoundFirstPlayer, getOnlineRoundSecondPlayer, getOnlineScoreCard } from './test.helper';

export class MimicBackendScoreInterceptor implements HttpInterceptor{

  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any>> {

    if (req.url.endsWith('rest/OnlineRounds') || req.url.endsWith('rest/OnlineRound')) {
      return new Observable<any> (observer => {
        observer.next(new HttpResponse<any>({status: 200}));
        observer.complete();
      });
    } else if (req.url.endsWith('rest/OnlineRoundOwner/1')) {
      return new Observable(observer => {
        observer.next(new HttpResponse<Array<any>>({body:

          [
            getOnlineRoundFirstPlayer(),
            getOnlineRoundSecondPlayer()
          ]

        , status: 200}));
        observer.complete();
      });
    } else if (req.url.startsWith('rest/OnlineScoreCard')) {
      return new Observable(observer => {
        observer.next(new HttpResponse<Array<any>>({body:

          [
            getOnlineScoreCard()
          ]

        , status: 200}));
        observer.complete();
      });
    } else if (req.url.endsWith('rest/OnlineRoundCourse/1')) {
      return new Observable(observer => {
        observer.next(new HttpResponse<Array<any>>({body:

          [
            getOnlineRoundFirstPlayer()
          ]

        , status: 200}));
        observer.complete();
      });
    }
    // pass through other requests.
    return next.handle(req);
  }
}




