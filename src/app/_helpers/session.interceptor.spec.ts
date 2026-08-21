import { TestBed } from '@angular/core/testing';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SessionRecoveryInterceptor } from './session.interceptor';
import { AuthenticationService } from '@/_services/authentication.service';
import { HttpService } from '@/_services/http.service';

class MockHttpService {
  refresh = jasmine.createSpy('refresh');
}

class MockAuthenticationService {
  currentPlayerValue: { id: number } | null = { id: 1 };
  logout = jasmine.createSpy('logout');
}

class MockRouter {
  navigate = jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true));
}

const tokenExpiredError = () =>
  new HttpErrorResponse({
    status: 401,
    headers: new HttpHeaders({ 'WWW-Authenticate': 'Bearer error="token_expired"' }),
  });

const okEvent = new HttpResponse({ status: 200 }) as HttpEvent<unknown>;

describe('SessionRecoveryInterceptor', () => {
  let interceptor: SessionRecoveryInterceptor;
  let httpService: MockHttpService;
  let authService: MockAuthenticationService;
  let router: MockRouter;
  let next: HttpHandler;
  let handleSpy: jasmine.Spy;
  let cookieValue: string;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SessionRecoveryInterceptor,
        { provide: HttpService, useClass: MockHttpService },
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        { provide: Router, useClass: MockRouter },
      ],
    });

    interceptor = TestBed.inject(SessionRecoveryInterceptor);
    httpService = TestBed.inject(HttpService) as unknown as MockHttpService;
    authService = TestBed.inject(AuthenticationService) as unknown as MockAuthenticationService;
    router = TestBed.inject(Router) as unknown as MockRouter;

    handleSpy = jasmine.createSpy('handle');
    next = { handle: handleSpy };

    // replace the inherited document.cookie getter with a controllable one
    cookieValue = '';
    Object.defineProperty(document, 'cookie', {
      configurable: true,
      get: () => cookieValue,
      set: (value: string) => {
        cookieValue = value;
      },
    });
  });

  afterEach(() => {
    // remove the own descriptor so the native prototype getter is restored
    delete (document as unknown as { cookie?: unknown }).cookie;
  });

  it('should pass whitelisted URLs straight through without recovery handling', () => {
    const bypassUrls = [
      'rest/Authenticate',
      'rest/AddPlayer',
      'rest/Refresh/1',
      'signin/google',
      'rest/GetSocialPlayer',
    ];

    bypassUrls.forEach((url) => {
      handleSpy.calls.reset();
      handleSpy.and.returnValue(of(okEvent));
      const req = new HttpRequest('GET', url);

      interceptor.intercept(req, next).subscribe();

      expect(handleSpy).toHaveBeenCalledOnceWith(req);
    });
  });

  it('should not attempt a refresh for a token-expiry error on a whitelisted URL', () => {
    handleSpy.and.returnValue(throwError(() => tokenExpiredError()));
    const req = new HttpRequest('GET', 'rest/Refresh/1');

    let caught: unknown;
    interceptor.intercept(req, next).subscribe({ error: (e) => (caught = e) });

    expect(caught).toBeInstanceOf(HttpErrorResponse);
    expect(httpService.refresh).not.toHaveBeenCalled();
  });

  it('should refresh the token and retry the original request on token expiry', () => {
    const req = new HttpRequest('GET', 'rest/GetPlayers');
    let call = 0;
    handleSpy.and.callFake(() => {
      call++;
      return call === 1 ? throwError(() => tokenExpiredError()) : of(okEvent);
    });
    httpService.refresh.and.returnValue(of(new HttpResponse({ status: 200 })));

    let result: HttpEvent<unknown> | undefined;
    interceptor.intercept(req, next).subscribe((event) => (result = event));

    expect(httpService.refresh).toHaveBeenCalledOnceWith(1);
    expect(handleSpy).toHaveBeenCalledTimes(2);
    expect(result).toBe(okEvent);
    expect(authService.logout).not.toHaveBeenCalled();
  });

  it('should logout and navigate to login when the refresh itself fails', () => {
    const req = new HttpRequest('GET', 'rest/GetPlayers');
    handleSpy.and.returnValue(throwError(() => tokenExpiredError()));
    const refreshError = new Error('refresh failed');
    httpService.refresh.and.returnValue(throwError(() => refreshError));

    let caught: unknown;
    interceptor.intercept(req, next).subscribe({ error: (e) => (caught = e) });

    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(caught).toBe(refreshError);
  });

  it('should retry a 403 once with the fresh XSRF token from the cookie', () => {
    cookieValue = 'foo=bar; XSRF-TOKEN=abc%20123';
    const req = new HttpRequest('GET', 'rest/GetPlayers');
    let call = 0;
    handleSpy.and.callFake(() => {
      call++;
      return call === 1 ? throwError(() => new HttpErrorResponse({ status: 403 })) : of(okEvent);
    });

    let result: HttpEvent<unknown> | undefined;
    interceptor.intercept(req, next).subscribe((event) => (result = event));

    expect(handleSpy).toHaveBeenCalledTimes(2);
    const retried = handleSpy.calls.argsFor(1)[0] as HttpRequest<unknown>;
    expect(retried.headers.get('X-CSRF-Retry')).toBe('1');
    expect(retried.headers.get('X-XSRF-TOKEN')).toBe('abc 123');
    expect(result).toBe(okEvent);
  });

  it('should retry a 403 without an XSRF header when no cookie is present', () => {
    cookieValue = 'unrelated=value';
    const req = new HttpRequest('GET', 'rest/GetPlayers');
    let call = 0;
    handleSpy.and.callFake(() => {
      call++;
      return call === 1 ? throwError(() => new HttpErrorResponse({ status: 403 })) : of(okEvent);
    });

    interceptor.intercept(req, next).subscribe();

    const retried = handleSpy.calls.argsFor(1)[0] as HttpRequest<unknown>;
    expect(retried.headers.get('X-CSRF-Retry')).toBe('1');
    expect(retried.headers.has('X-XSRF-TOKEN')).toBeFalse();
  });

  it('should not retry a 403 that already carries the retry marker', () => {
    const req = new HttpRequest('GET', 'rest/GetPlayers', {
      headers: new HttpHeaders({ 'X-CSRF-Retry': '1' }),
    });
    const error = new HttpErrorResponse({ status: 403 });
    handleSpy.and.returnValue(throwError(() => error));

    let caught: unknown;
    interceptor.intercept(req, next).subscribe({ error: (e) => (caught = e) });

    expect(handleSpy).toHaveBeenCalledTimes(1);
    expect(caught).toBe(error);
  });

  it('should rethrow a 401 that is not a token-expiry error without refreshing', () => {
    const req = new HttpRequest('GET', 'rest/GetPlayers');
    const error = new HttpErrorResponse({ status: 401 });
    handleSpy.and.returnValue(throwError(() => error));

    let caught: unknown;
    interceptor.intercept(req, next).subscribe({ error: (e) => (caught = e) });

    expect(httpService.refresh).not.toHaveBeenCalled();
    expect(caught).toBe(error);
  });

  it('should rethrow unrelated errors untouched', () => {
    const req = new HttpRequest('GET', 'rest/GetPlayers');
    const error = new HttpErrorResponse({ status: 500 });
    handleSpy.and.returnValue(throwError(() => error));

    let caught: unknown;
    interceptor.intercept(req, next).subscribe({ error: (e) => (caught = e) });

    expect(handleSpy).toHaveBeenCalledTimes(1);
    expect(httpService.refresh).not.toHaveBeenCalled();
    expect(caught).toBe(error);
  });
});
