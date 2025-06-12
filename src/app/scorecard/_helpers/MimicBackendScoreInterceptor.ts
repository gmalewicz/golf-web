import { HttpHandler, HttpHeaderResponse, HttpInterceptor, HttpProgressEvent, HttpRequest, HttpResponse, HttpSentEvent, HttpUserEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getOnlineRoundFirstPlayer, getOnlineRoundSecondPlayer, getOnlineScoreCard } from './test.helper';

export class MimicBackendScoreInterceptor implements HttpInterceptor{

  intercept(req: HttpRequest<unknown>, next: HttpHandler):
    Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<unknown> | HttpUserEvent<unknown>> {

    if (req.url.endsWith('rest/OnlineRounds')|| req.url.startsWith('rest/FinalizeOnlineOwnerRounds') || req.url.startsWith('rest/OnlineRoundForOwner')) {
      return new Observable (observer => {
        observer.next(new HttpResponse<unknown>({status: 200}));
        observer.complete();
      });
    } else if (req.url.endsWith('rest/OnlineRound') || req.url.endsWith('rest/OnlineRoundCourse/1')) {
      return new Observable(observer => {
        observer.next(new HttpResponse<Array<unknown>>({body:

          [
            getOnlineRoundFirstPlayer()
          ]

        , status: 200}));
        observer.complete();
      });
    } else if (req.url.endsWith('rest/OnlineRoundOwner/1')) {
      return new Observable(observer => {
        observer.next(new HttpResponse<Array<unknown>>({body:

          [
            getOnlineRoundFirstPlayer(),
            getOnlineRoundSecondPlayer()
          ]

        , status: 200}));
        observer.complete();
      });
    } else if (req.url.startsWith('rest/OnlineScoreCard')) {
      return new Observable(observer => {
        observer.next(new HttpResponse<Array<unknown>>({body:

          [
            getOnlineScoreCard()
          ]

        , status: 200}));
        observer.complete();
      });
    }
    // pass through other requests.
    return next.handle(req);
  }
}




