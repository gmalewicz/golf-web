import { HttpClient, HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, tick, waitForAsync, fakeAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SessionRecoveryInterceptor } from '../session.interceptor';
import { authenticationServiceStub, MyRouterStub } from '../test.helper';
import { AuthenticationService } from '@/_services/authentication.service';
import { HttpService } from '@/_services/http.service';
import { of, throwError } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

const httpServiceStub: Partial<HttpService> = {
  refresh(_playerId: number) {
    return of(new HttpResponse({ status: 200 }));
  }
};

describe('session.interceptor', () => {

  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        { provide: Router, useClass: MyRouterStub },
        { provide: HTTP_INTERCEPTORS, useClass: SessionRecoveryInterceptor, multi: true },
        { provide: AuthenticationService, useValue: authenticationServiceStub },
        { provide: HttpService, useValue: httpServiceStub },
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  }));

  afterEach(() => {
    httpMock.verify();
  });

  it('should pass through requests to excluded URLs without interception', fakeAsync(() => {
    // Requests to Authenticate, AddPlayer, Refresh and GetSocialPlayer
    // must never be intercepted (would cause infinite loop on the Refresh call itself).

    let response: unknown;

    httpClient.post('rest/Authenticate', {}).subscribe(res => response = res);

    const req = httpMock.expectOne('rest/Authenticate');
    req.flush({ nick: 'test' });

    tick(200);

    expect(response).toBeTruthy();
  }));

  it('should pass through a successful response unchanged', fakeAsync(() => {

    let response: unknown;

    httpClient.get('/rest/Courses').subscribe(res => response = res);

    const req = httpMock.expectOne('/rest/Courses');
    req.flush([{ id: 1 }]);

    tick(200);

    expect(response).toBeTruthy();
  }));

  it('should call /rest/Refresh and retry original request on 401 token_expired', fakeAsync(() => {
    // RFC 6750: 401 + WWW-Authenticate: Bearer error="token_expired"
    // should trigger a call to /rest/Refresh then replay the original request.

    let response: unknown;

    httpClient.get('/rest/Courses').subscribe(res => response = res);

    // First attempt — access token expired
    const firstReq = httpMock.expectOne('/rest/Courses');
    firstReq.flush('Unauthorized', {
      status: 401,
      statusText: 'Unauthorized',
      headers: { 'WWW-Authenticate': 'Bearer error="token_expired"' },
    });

    tick(200);

    // Interceptor calls /rest/Refresh via HttpService.refresh()
    // (handled by httpServiceStub — no actual HTTP call)

    // Retried original request
    const retryReq = httpMock.expectOne('/rest/Courses');
    retryReq.flush([{ id: 1 }]);

    tick(200);

    expect(response).toBeTruthy();
  }));

  it('should NOT intercept a plain 401 without token_expired header', fakeAsync(() => {
    // A plain 401 (e.g. wrong credentials) must not trigger the refresh flow.

    let errResponse: unknown;

    httpClient.get('/rest/Courses').subscribe({ error: err => errResponse = err });

    const req = httpMock.expectOne('/rest/Courses');
    req.flush('Unauthorized', {
      status: 401,
      statusText: 'Unauthorized',
    });

    tick(200);

    expect(errResponse).toBeTruthy();
    // No retry request should have been made
    httpMock.verify();
  }));

  it('should NOT intercept a 401 with invalid_token header (handled by ErrorInterceptor)', fakeAsync(() => {
    // 401 + invalid_token means both tokens dead — ErrorInterceptor forces logout,
    // SessionRecoveryInterceptor must not attempt a refresh.

    let errResponse: unknown;

    httpClient.get('/rest/Courses').subscribe({ error: err => errResponse = err });

    const req = httpMock.expectOne('/rest/Courses');
    req.flush('Unauthorized', {
      status: 401,
      statusText: 'Unauthorized',
      headers: { 'WWW-Authenticate': 'Bearer error="invalid_token"' },
    });

    tick(200);

    expect(errResponse).toBeTruthy();
    httpMock.verify();
  }));

});

describe('session.interceptor — refresh failure', () => {

  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  const refreshError = new Error('refresh failed');
  const failingHttpServiceStub: Partial<HttpService> = {
    refresh(_playerId: number) {
      return throwError(() => refreshError);
    }
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        { provide: Router, useClass: MyRouterStub },
        { provide: HTTP_INTERCEPTORS, useClass: SessionRecoveryInterceptor, multi: true },
        { provide: AuthenticationService, useValue: authenticationServiceStub },
        { provide: HttpService, useValue: failingHttpServiceStub },
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  }));

  afterEach(() => {
    httpMock.verify();
  });

  it('should logout, navigate to /login and rethrow error when refresh fails', fakeAsync(() => {
    const authService = TestBed.inject(AuthenticationService);
    const router = TestBed.inject(Router);
    spyOn(authService, 'logout');
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    let caughtError: unknown;
    httpClient.get('/rest/Courses').subscribe({ error: err => caughtError = err });

    const req = httpMock.expectOne('/rest/Courses');
    req.flush('Unauthorized', {
      status: 401,
      statusText: 'Unauthorized',
      headers: { 'WWW-Authenticate': 'Bearer error="token_expired"' },
    });

    tick(200);

    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(caughtError).toBe(refreshError);
  }));
});
