import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { HttpService } from '@/_services/http.service';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RecaptchaModule, RecaptchaFormsModule} from 'ng-recaptcha';
import { RegistrationComponent } from './registration.component';
import { PreloadAllModules, Router, provideRouter, withPreloading } from '@angular/router';
import { AlertService } from '@/_services/alert.service';
import { alertServiceStub } from '@/_helpers/test.helper';
import { routing } from '@/app.routing';
import { NgModule } from '@angular/core';

@NgModule()
export class FixNavigationTriggeredOutsideAngularZoneNgModule {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_router: Router) {
  }
}

describe('RegistrationComponent', () => {
  let component: RegistrationComponent;
  let fixture: ComponentFixture<RegistrationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [
        ReactiveFormsModule,
        RecaptchaModule,
        RecaptchaFormsModule,
        RegistrationComponent,
        FixNavigationTriggeredOutsideAngularZoneNgModule
    ],
    providers: [HttpService,
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true },
        //{ provide: Router, useClass: MyRouterStub },
        { provide: AlertService, useValue: alertServiceStub },
        provideHttpClient(withInterceptorsFromDi()),
        provideRouter(routing, withPreloading(PreloadAllModules))]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should click save button with valid form', fakeAsync(() => {

    component.f.nick.setValue('test');
    component.f.password.setValue('welcome');
    component.f.whs.setValue(12.5);
    component.f.recaptchaReactive.setValue('asdsdasdaddasa');
    component.f.female.setValue(false);

    component.onSubmit();
    expect(component.loading).toBeTruthy();

  }));

  it('should click sex button', fakeAsync(() => {

    component.f.male.setValue(true);

    component.sexClick(true);
    expect(component.f.male.value).toBeFalsy();

  }));
});
