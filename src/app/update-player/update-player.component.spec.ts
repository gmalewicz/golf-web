import { routing } from '@/app.routing';
import { ErrorInterceptor, JwtInterceptor } from '@/_helpers';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { AuthenticationService } from '@/_services';
import { HttpService } from '@/_services/http.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { UpdatePlayerComponent } from './update-player.component';

describe('UpdatePlayerComponent', () => {
  let component: UpdatePlayerComponent;
  let fixture: ComponentFixture<UpdatePlayerComponent>;
  let authenticationService: AuthenticationService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdatePlayerComponent ],
      imports: [
        HttpClientModule,
        routing,
        ReactiveFormsModule,
      ],
      providers: [HttpService,
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        AuthenticationService
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    localStorage.setItem('currentPlayer', JSON.stringify([{nick: 'test', id: 1, password: 'test', whs: '10.2'}]));
    fixture = TestBed.createComponent(UpdatePlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create but player does not exists', () => {
    authenticationService = TestBed.inject(AuthenticationService);
    authenticationService.logout();
    fixture = TestBed.createComponent(UpdatePlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should test with empty form', fakeAsync(() => {
    const btnElement = fixture.debugElement.query(By.css('.btn-success'));
    btnElement.nativeElement.click();
    tick();
    expect(component.f.password.hasError).toBeTruthy();
  }));

  it('should test with invalid form', fakeAsync(() => {
    component.f.password.setValue('a');
    const btnElement = fixture.debugElement.query(By.css('.btn-success'));
    btnElement.nativeElement.click();
    tick();
    expect(component.f.password.hasError).toBeTruthy();
  }));

  it('should test with correct whs', fakeAsync(() => {
    component.f.whs.setValue('43.2');
    const btnElement = fixture.debugElement.query(By.css('.btn-success'));
    btnElement.nativeElement.click();
    tick();
    expect(component.f.whs.value).toContain('43.2');
  }));

  it('should test with correct password', fakeAsync(() => {
    component.f.password.setValue('123456');
    const btnElement = fixture.debugElement.query(By.css('.btn-success'));
    btnElement.nativeElement.click();
    tick();
    expect(component.f.password.value).toContain('123456');
  }));

  afterEach(() => {
    localStorage.removeItem('currentPlayer');
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
