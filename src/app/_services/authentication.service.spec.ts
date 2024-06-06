import { TestBed, waitForAsync } from "@angular/core/testing";
import { AuthenticationService } from "./authentication.service";
import { HttpService } from "./http.service";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { MimicBackendAppInterceptor } from "@/_helpers/MimicBackendAppInterceptor";

describe('autentication service', () => {

  let authenticationService: AuthenticationService;

  beforeEach(waitForAsync(() => {

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
    authenticationService.loginSocial({nick: 'test', id: 1, password: 'test', whs: 10.2, role: 0});
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
