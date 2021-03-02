import { routing } from '@/app.routing';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { HttpService } from '@/_services/http.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RecaptchaModule, RecaptchaFormsModule} from 'ng-recaptcha';
import { RegistrationComponent } from './registration.component';

describe('RegistrationComponent', () => {
  let component: RegistrationComponent;
  let fixture: ComponentFixture<RegistrationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistrationComponent ],
      imports: [
        HttpClientModule,
        ReactiveFormsModule,
        RecaptchaModule,
        RecaptchaFormsModule,
        routing,
      ]
      ,
      providers: [HttpService,
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true }]
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
