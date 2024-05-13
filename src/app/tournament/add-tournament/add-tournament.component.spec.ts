import { AlertService, AuthenticationService, HttpService } from '@/_services';
import { HttpClientModule, HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AddTournamentComponent } from './add-tournament.component';
import { MimicBackendTournamentInterceptor } from '../_helpers/MimicBackendTournamentInterceptor';
import { alertServiceStub, authenticationServiceStub } from '@/_helpers/test.helper';
import { routing } from '@/app.routing';
import { PreloadAllModules, Router, provideRouter, withPreloading } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

@NgModule()
export class FixNavigationTriggeredOutsideAngularZoneNgModule {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_router: Router) {
  }
}

describe('AddTournamentComponent', () => {
  let component: AddTournamentComponent;
  let fixture: ComponentFixture<AddTournamentComponent>;

  const standardSetup = () => {
    fixture = TestBed.createComponent(AddTournamentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        AddTournamentComponent,
        RouterTestingModule.withRoutes([]),
        BrowserAnimationsModule,
        FixNavigationTriggeredOutsideAngularZoneNgModule
      ],
      providers: [HttpService,
        { provide: AuthenticationService, useValue: authenticationServiceStub },
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendTournamentInterceptor, multi: true },
        //{ provide: Router, useClass: MyRouterStub },
        { provide: AuthenticationService, useValue: authenticationServiceStub },
        { provide: AlertService, useValue: alertServiceStub },
        provideHttpClient(withInterceptorsFromDi()),
        provideRouter(routing, withPreloading(PreloadAllModules)),
      ]
    })
    .compileComponents();
  }));

  it('should create', () => {
    standardSetup();
    expect(component).toBeTruthy();
  });

  it('should create but player not signed on', () => {
    spyOnProperty(authenticationServiceStub , 'currentPlayerValue', 'get').and.returnValue(null);
    standardSetup();
    expect(component).toBeTruthy();
  });

  it('should add tournament with valid data', () => {
    standardSetup();
    component.f.name.setValue('Test');
    component.f.startDate.setValue('2023/10/10');
    component.f.endDate.setValue('2023/10/10');
    component.f.bestRounds.setValue('0');
    component.onSubmit();
    expect(component.loading).toBeFalsy();
  });

  it('should add tournament with invalid form', () => {
    standardSetup();
    component.onSubmit();
    expect(component.submitted).toBeTruthy();
  });

  it('should add tournament with end date lower than start date', () => {
    standardSetup();
    component.f.name.setValue('Test');
    component.f.startDate.setValue('2023/10/10');
    component.f.endDate.setValue('2023/10/09');
    component.f.bestRounds.setValue('0');
    component.onSubmit();
    expect(component.submitted).toBeTruthy();
    expect(component.loading).toBeFalsy();
  });

  afterEach(() => {
    localStorage.removeItem('currentPlayer');
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
