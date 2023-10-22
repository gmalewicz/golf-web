import { HttpClient, HTTP_INTERCEPTORS, HttpHeaders } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import { TestBed, tick, waitForAsync, fakeAsync } from '@angular/core/testing';
import { Player } from '@/_models';
import { PlayerDataInterceptor } from '../playerData.interceptor';
import { AuthenticationService } from '@/_services/authentication.service';
import { HttpService } from '@/_services';
import { authenticationServiceStub } from '../test.helper';

describe('playerData.interceptor', () => {

  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        { provide: AuthenticationService, useValue: authenticationServiceStub},
        { provide: HTTP_INTERCEPTORS, useClass: PlayerDataInterceptor, multi: true }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  }));

  it('verify request without player data', fakeAsync(() => {

    let playerResponse: Player;

    httpClient.post('rest/Authenticate', {nick: 'Test', password: 'password'}).subscribe({next: player => playerResponse = player});
    const req = httpMock.expectOne('rest/Authenticate');

    req.flush({nick: 'Test}'});

    tick(200);

    expect(playerResponse.nick).toMatch('Test');
  }));

  it('verify request with player data', fakeAsync(() => {

    let playerResponse: Player;

    httpClient.get('rest/Courses').subscribe({next: player => playerResponse = player});

    const req = httpMock.expectOne('rest/Courses');
    req.flush({nick: 'Test}'}, {headers: {hcp: '10.1', sex: 'true'}});

    tick(200);

    expect(playerResponse.nick).toMatch('Test');
  }));
});
