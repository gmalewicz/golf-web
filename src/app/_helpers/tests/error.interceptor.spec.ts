import { AlertService } from '@/_services/alert.service';
import { HttpClient, HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, tick, waitForAsync, fakeAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ErrorInterceptor } from '../error.interceptor';
import { alertServiceStub, authenticationServiceStub, MyRouterStub} from '../test.helper';
import { AuthenticationService } from '@/_services/authentication.service';

describe('error.interceptor', () => {

  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [
        { provide: AlertService, useValue: alertServiceStub },
        { provide: Router, useClass: MyRouterStub },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: AuthenticationService, useValue: authenticationServiceStub },
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
});

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  }));

  it('repsonse error 0', fakeAsync(() => {

    let errResponse: string;

    httpClient.get('/rest/Courses').subscribe({ error: err => errResponse = err});

    const req = httpMock.expectOne('/rest/Courses');

    req.error(new ProgressEvent('Error 0'), {
      status: 0,
      statusText: '0',
    });

    tick(200);

    expect(errResponse).toMatch('Error: 0');

  }));

  it('repsonse error 404', fakeAsync(() => {

    let errResponse: string;

    httpClient.get('/rest/Courses').subscribe({error: err => errResponse = err});

    const req = httpMock.expectOne('/rest/Courses');

    req.error(new ProgressEvent('Error 404'), {
      status: 404,
      statusText: '404',
    });

    tick(200);
    expect(errResponse).toMatch('Error: 404');

  }));

  it('repsonse error 504', fakeAsync(() => {

    let errResponse: string;

    httpClient.get('/rest/Courses').subscribe({error: err => errResponse = err});

    const req = httpMock.expectOne('/rest/Courses');

    req.error(new ProgressEvent('Error 504'), {
      status: 504,
      statusText: '504',
    });

    tick(200);

    expect(errResponse).toMatch('Error: 504');

  }));

  it('repsonse error 402', fakeAsync(() => {

    let errResponse: string;

    httpClient.get('/rest/Courses').subscribe({error: err => errResponse = err});

    const req = httpMock.expectOne('/rest/Courses');

    req.error(new ProgressEvent('Error 402'), {
      status: 402,
      statusText: '402',
    });

    tick(200);

    expect(errResponse).toMatch('Error: 402');

  }));

  it('repsonse error 401', fakeAsync(() => {

    let errResponse: string;

    httpClient.get('/rest/Courses').subscribe({error: err => errResponse = err});

    const req = httpMock.expectOne('/rest/Courses');

    req.error(new ProgressEvent('Error 401'), {
      status: 401,
      statusText: '401',
    });

    tick(200);

    expect(errResponse).toMatch('Error: 401');

  }));

  it('response error 401 with invalid_token forces logout', fakeAsync(() => {
    // Replaces old '998' test — the server now sends 401 + RFC 6750 invalid_token header
    // to signal that both tokens are dead and the user must re-authenticate.

    let errResponse: string;

    httpClient.get('/rest/Courses').subscribe({error: err => errResponse = err});

    const req = httpMock.expectOne('/rest/Courses');

    req.flush('Unauthorized', {
      status: 401,
      statusText: 'Unauthorized',
      headers: { 'WWW-Authenticate': 'Bearer error="invalid_token"' },
    });

    tick(200);

    expect(errResponse).toMatch('Error: 401');

  }));

  it('response error 401 with token_expired passes through to SessionRecoveryInterceptor', fakeAsync(() => {
    // The error interceptor must NOT consume token_expired 401s —
    // they are handled by SessionRecoveryInterceptor which calls /rest/Refresh.

    let errResponse: string;

    httpClient.get('/rest/Courses').subscribe({error: err => errResponse = err});

    const req = httpMock.expectOne('/rest/Courses');

    req.flush('Unauthorized', {
      status: 401,
      statusText: 'Unauthorized',
      headers: { 'WWW-Authenticate': 'Bearer error="token_expired"' },
    });

    tick(200);

    // Error is re-thrown as-is (HttpErrorResponse), not converted to Error string
    expect(errResponse).toBeInstanceOf(Object);
    expect((errResponse as unknown as { status: number }).status).toBe(401);

  }));

  it('repsonse error 403', fakeAsync(() => {

    let errResponse: string;

    httpClient.get('/rest/Courses').subscribe({error: err => errResponse = err});

    const req = httpMock.expectOne('/rest/Courses');

    req.error(new ProgressEvent('Error 403'), {
      status: 403,
      statusText: '403',
    });

    tick(200);

    expect(errResponse).toMatch('Error: 403');

  }));
});
