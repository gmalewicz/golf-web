import { AuthenticationService } from './../_services/authentication.service';
import { routing } from '@/app.routing';
import { ErrorInterceptor } from '@/_helpers/error.interceptor';
import { JwtInterceptor } from '@/_helpers/jwt.interceptor';
import { HttpService } from '@/_services/http.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { AdminComponent } from './admin.component';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { CommonModule } from '@angular/common';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;
  let authenticationService: AuthenticationService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminComponent ],
      imports: [
        HttpClientModule,
        routing,
        ReactiveFormsModule,
        MatDialogModule,
        CommonModule
      ],
      providers: [HttpService,
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        AuthenticationService
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    localStorage.setItem('currentPlayer', JSON.stringify([{nick: 'test', id: 1}]));
    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('call loadComponent for moveCourse', fakeAsync(() => {

    fixture.whenStable().then(() => {
      component.loadComponent(1).then(() => {
        expect(component.adminContainerRef.length).toMatch('1');
      });
    });
    expect().nothing();
  }));

  it('should create but player does not exists', () => {
    authenticationService = TestBed.inject(AuthenticationService);
    authenticationService.logout();
    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('call loadComponent for updRoundHcp', fakeAsync(() => {

    fixture.whenStable().then(() => {
      component.loadComponent(2).then(() => {
        expect(component.adminContainerRef.length).toMatch('1');
      });
    });
    expect().nothing();
  }));

  it('call loadComponent for playerRoundCnt', fakeAsync(() => {

    fixture.whenStable().then(() => {
      component.loadComponent(3).then(() => {
        expect(component.adminContainerRef.length).toMatch('1');
      });
    });
    expect().nothing();
  }));

  afterEach(() => {
    localStorage.removeItem('currentPlayer');
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
