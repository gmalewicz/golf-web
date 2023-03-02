import { routing } from '@/app.routing';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { authenticationServiceStub, MatDialogMock } from '@/_helpers/test.helper';
import { AlertService } from '@/_services/alert.service';
import { AuthenticationService } from '@/_services/authentication.service';
import { HttpService } from '@/_services/http.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {

  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  const routeStub = {
    snapshot: {
      queryParams: {
      }
    }
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginComponent ],
      imports: [
        HttpClientModule,
        ReactiveFormsModule,
        routing,
        MatDialogModule,
      ],
      providers: [HttpService,
                  { provide: AuthenticationService, useValue: authenticationServiceStub },
                  {provide: ActivatedRoute, useValue: routeStub},
                  {provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true },
                  { provide: MatDialog, useClass: MatDialogMock},
                  AlertService]
    })
    .compileComponents();
  }));

  beforeEach(() => {

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
  });

  it('should submit with proper data', () => {
    fixture.detectChanges();
    component.f.username.setValue('test_user');
    component.f.password.setValue('test_password');
    component.onSubmit();
    expect(component.submitted).toBeTruthy();
  });

  it('should submit with wrong data', () => {
    fixture.detectChanges();
    component.f.username.setValue('test_user');
    component.onSubmit();
    expect(component.loginForm.invalid).toBeTruthy();
  });

  it('should process social login for known player', () => {
    routeStub.snapshot.queryParams = {token: 'test'};
    component.urlFacebook = null;
    fixture.detectChanges();
    expect(component.loginForm.invalid).toBeTruthy();
  });

  it('should process social login for unknown player', () => {
    routeStub.snapshot.queryParams = {token: 'test', new_player: 'true'};
    component.urlFacebook = null;
    fixture.detectChanges();
    expect(component.loginForm.invalid).toBeTruthy();
  });

  it('should set social loading flag', () => {
    fixture.detectChanges();
    component.startSocialLoading();
    expect(component.socialLoading).toBeTruthy();
  });

  it('should process social login for with authorization failure', () => {
    routeStub.snapshot.queryParams = {error: 'authFailed'};
    component.urlFacebook = null;
    fixture.detectChanges();
    expect(component.loginForm.invalid).toBeTruthy();
  });

  it('should process social login for with incorrect log in', () => {
    routeStub.snapshot.queryParams = {error: 'playerType'};
    component.urlFacebook = null;
    fixture.detectChanges();
    expect(component.loginForm.invalid).toBeTruthy();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
