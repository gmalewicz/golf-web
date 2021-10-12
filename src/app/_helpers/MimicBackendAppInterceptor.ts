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
    } else if (req.url.endsWith('rest/Player/Other2')) {
      return new Observable(observer => {
        observer.next(new HttpResponse<Array<any>>({body:

          [
            {nick: 'Other2', id: 2, whs: 20}
          ]

        , status: 200}));
        observer.complete();
      });
    } else if ((req.url.endsWith('rest/Round')) ||
               (req.url.endsWith('rest/ScoreCard') && (req.method === 'PATCH')) ||
               (req.url.endsWith('rest/DeleteFavouriteCourse/1')) ||
               (req.url.endsWith('rest/AddPlayer')) ||
               (req.url.endsWith('rest/Player/Other')) ||
               (req.url.endsWith('rest/TournamentResult/1')) ||
               (req.url.endsWith('rest/MoveToHistoryCourse/1')) ||
               (req.url.endsWith('rest/ResetPassword')) ||
               (req.url.endsWith('rest/PatchPlayer'))
               ) {
      return new Observable<any> (observer => {
        observer.next(new HttpResponse<any>({status: 200}));
        observer.complete();
      });
    } else if (req.url.endsWith('rest/ScoreCard/1')) {
        return new Observable<any> (observer => {
          observer.next(new HttpResponse<Array<any>>({body:

            [{id: 1, hole: 1, stroke: 10, pats: 0,  player: {id: 1, nick: 'test'}},
              {id: 2, hole: 2, stroke: 1, pats: 0 },
              {id: 3, hole: 3, stroke: 1, pats: 0 },
              {id: 4, hole: 4, stroke: 1, pats: 0 },
              {id: 5, hole: 5, stroke: 1, pats: 0 },
              {id: 6, hole: 6, stroke: 1, pats: 0 },
              {id: 7, hole: 7, stroke: 1, pats: 0 },
              {id: 8, hole: 8, stroke: 1, pats: 0 },
              {id: 9, hole: 9, stroke: 1, pats: 0 },
              {id: 10, hole: 10, stroke: 1, pats: 0 },
              {id: 11, hole: 11, stroke: 1, pats: 0 },
              {id: 12, hole: 12, stroke: 1, pats: 0 },
              {id: 13, hole: 13, stroke: 1, pats: 0 },
              {id: 14, hole: 14, stroke: 1, pats: 0 },
              {id: 15, hole: 15, stroke: 1, pats: 0 },
              {id: 16, hole: 16, stroke: 1, pats: 0 },
              {id: 17, hole: 17, stroke: 1, pats: 0 },
              {id: 18, hole: 18, stroke: 1, pats: 0 },
              {id: 19, hole: 1, stroke: 2, pats: 0 ,  player: {id: 2, nick: 'test2'}},
              {id: 20, hole: 2, stroke: 20, pats: 0},
              {id: 21, hole: 3, stroke: 2, pats: 0},
              {id: 22, hole: 4, stroke: 2, pats: 0},
              {id: 23, hole: 5, stroke: 2, pats: 0},
              {id: 24, hole: 6, stroke: 2, pats: 0},
              {id: 25, hole: 7, stroke: 2, pats: 0},
              {id: 26, hole: 8, stroke: 2, pats: 0},
              {id: 27, hole: 9, stroke: 2, pats: 0},
              {id: 28, hole: 10, stroke: 2, pats: 0},
              {id: 29, hole: 11, stroke: 2, pats: 0},
              {id: 30, hole: 12, stroke: 2, pats: 0},
              {id: 31, hole: 13, stroke: 2, pats: 0},
              {id: 32, hole: 14, stroke: 2, pats: 0},
              {id: 33, hole: 15, stroke: 2, pats: 0},
              {id: 34, hole: 16, stroke: 2, pats: 0},
              {id: 35, hole: 17, stroke: 2, pats: 0},
              {id: 36, hole: 18, stroke: 2, pats: 0}]

          , status: 200}));
          observer.complete();
        });
    } else if (req.url.endsWith('rest/RoundPlayersDetails/1')) {
      return new Observable(observer => {
        observer.next(new HttpResponse<Array<any>>({body:

          [
            {playerId: 1, whs: 36.6, teeId: 49, cr: 71.8, sr: 124, teeType: 0},
            {playerId: 2, whs: 32.9, teeId: 48, cr: 69.4, sr: 118, teeType: 0}
          ]

        , status: 200}));
        observer.complete();
      });
    } else if (req.url.endsWith('rest/FavouriteCourses/1') || req.url.endsWith('rest/SearchForCourse') || req.url.endsWith('rest/SortedCourses/0')){
      return new Observable(observer => {
        observer.next(new HttpResponse<Array<any>>({body:

          [
            {id: 2, name: 'Lisia Polana', par: 72, holeNbr: 18}
          ]

        , status: 200}));
        observer.complete();
      });
    }
    // pass through other requests.
    return next.handle(req);
  }
}
