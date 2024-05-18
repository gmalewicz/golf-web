import { AlertService } from '@/_services/alert.service';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
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
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        { provide: AlertService, useValue: alertServiceStub },
        { provide: Router, useClass: MyRouterStub },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: AuthenticationService, useValue: authenticationServiceStub },
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

  it('repsonse error 998', fakeAsync(() => {

    let errResponse: string;


    httpClient.get('/rest/Courses').subscribe({error: err => errResponse = err});

    const req = httpMock.expectOne('/rest/Courses');

    req.error(new ProgressEvent('Error 998'), {
      status: 998,
      statusText: '998',
    });

    tick(200);

    expect(errResponse).toMatch('Error: 998');

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
