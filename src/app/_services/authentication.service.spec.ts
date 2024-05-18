import { TestBed, waitForAsync } from "@angular/core/testing";
import { AuthenticationService } from "./authentication.service";
import { HttpService } from "./http.service";
import { Observable, of } from "rxjs";
import { HTTP_INTERCEPTORS, HttpClientModule, HttpResponse } from "@angular/common/http";
import { Player } from "@/_models";
import { MimicBackendAppInterceptor } from "@/_helpers/MimicBackendAppInterceptor";

describe('autentication service', () => {

  let authenticationService: AuthenticationService;
  let httpServiceSpy: jasmine.SpyObj<HttpService>;

  beforeEach(waitForAsync(() => {

    const spy = jasmine.createSpyObj('HttpService', ['authenticate']);

    TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ],
      providers: [
        HttpService,
         AuthenticationService,
         { provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true },
      ]
    });

    authenticationService = TestBed.inject(AuthenticationService);
    httpServiceSpy = TestBed.inject(HttpService) as jasmine.SpyObj<HttpService>;


    authenticationService.loginSocial({nick: 'test', id: 1, password: 'test', whs: 10.2, role: 0});
    //TestBed..createComponent(null);
  }));

  it('should get role', () => {
    const role: string = authenticationService.playerRole;
    expect(role).toBe('ROLE_ADMIN,ROLE_PLAYER');
  });

  it('should get empty string when is undefined', () => {
    authenticationService.updateJWT();
    authenticationService.logout();
    const role: string = authenticationService.playerRole;
    expect(role).toBe('');
  });

 afterEach(waitForAsync(() => {
  authenticationService.logout();
 }));
});
