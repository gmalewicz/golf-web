import { routing } from '@/app.routing';
import { ErrorInterceptor } from '@/_helpers';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { AuthenticationService } from '@/_services';
import { HttpService } from '@/_services/http.service';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { UpdatePlayerComponent } from './update-player.component';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { MatDialogMock } from '@/_helpers/test.helper';
import { MatDialog } from '@angular/material/dialog';

describe('UpdatePlayerComponent', () => {
  let component: UpdatePlayerComponent;
  let fixture: ComponentFixture<UpdatePlayerComponent>;
  let authenticationService: AuthenticationService;
  const dialog = new MatDialogMock();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [
        ReactiveFormsModule,
        UpdatePlayerComponent,
    ],
    providers: [HttpService,
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        AuthenticationService,
        provideHttpClient(withInterceptorsFromDi()),
        provideRouter(routing, withPreloading(PreloadAllModules)),
        { provide: MatDialog, useValue: dialog},
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

  it('should test with correct email', fakeAsync(() => {
    component.f.email.setValue('test@gmail.com');
    const btnElement = fixture.debugElement.query(By.css('.btn-success'));
    btnElement.nativeElement.click();
    tick();
    expect(component.f.email.value).toContain('test@gmail.com');
  }));

  it('should test remove email', fakeAsync(() => {
    const lblElement = fixture.debugElement.query(By.css('.lbl-remove'));
    lblElement.nativeElement.click();
    tick();
    expect(component.removeEmail).toBeFalsy();
  }));

  afterEach(() => {
    localStorage.removeItem('currentPlayer');
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
