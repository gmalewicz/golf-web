import { TournamentHttpService } from './../_services/tournamentHttp.service';
import { AlertService, AuthenticationService, HttpService } from '@/_services';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AddTournamentComponent } from './add-tournament.component';
import { Router } from '@angular/router';
import { MimicBackendTournamentInterceptor } from '../_helpers/MimicBackendTournamentInterceptor';
import { alertServiceStub, authenticationServiceStub, MyRouterStub } from '@/_helpers/test.helper';

describe('AddTournamentComponent', () => {
  let component: AddTournamentComponent;
  let fixture: ComponentFixture<AddTournamentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTournamentComponent ],
      imports: [
        HttpClientModule,
        ReactiveFormsModule,
      ],
      providers: [HttpService,
        { provide: AuthenticationService, useValue: authenticationServiceStub },
        { provide: Router, useClass: MyRouterStub },
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendTournamentInterceptor, multi: true },
        TournamentHttpService,
        { provide: AlertService, useValue: alertServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    localStorage.setItem('currentPlayer', JSON.stringify([{nick: 'test', id: 1, whs: '10.0'}]));
    fixture = TestBed.createComponent(AddTournamentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add tournament with valid data', () => {
    component.f.name.setValue('Test');
    component.f.startDate.setValue('2023/10/10');
    component.f.endDate.setValue('2023/10/10');
    component.f.bestRounds.setValue('0');
    component.onSubmit();
    expect(component.loading).toBeFalsy();
  });

  it('should add tournament with invalid form', () => {
    component.onSubmit();
    expect(component.submitted).toBeTruthy();
  });

  it('should add tournament with end date lower than start date', () => {
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
