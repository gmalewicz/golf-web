import { routing } from '@/app.routing';
import { authenticationServiceStub } from '@/_helpers/test.helper';
import { AuthenticationService, HttpService } from '@/_services';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MimicBackendTournamentInterceptor } from '../_helpers/MimicBackendTournamentInterceptor';
import { TournamentHttpService } from '../_services';

import { TournamentResultsComponent } from './tournament-results.component';

describe('TournamentResultsComponent', () => {

  let component: TournamentResultsComponent;
  let fixture: ComponentFixture<TournamentResultsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TournamentResultsComponent ],
      imports: [
        HttpClientModule,
        routing,
        ReactiveFormsModule,
      ],
      providers: [HttpService,
                  { provide: AuthenticationService, useValue: authenticationServiceStub },
                  TournamentHttpService,
                  { provide: HTTP_INTERCEPTORS, useClass: MimicBackendTournamentInterceptor, multi: true }
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    history.pushState({data: {tournament: {id: 1, name: 'test', startDate: '10/10/2020', endDate: '10/10/2020', player: {id: 1}}}}, '');
    fixture = TestBed.createComponent(TournamentResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

});
