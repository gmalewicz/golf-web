import { routing } from '@/app.routing';
import { authenticationServiceStub } from '@/_helpers/test.helper';
import { teeTypes } from '@/_models/tee';
import { AuthenticationService, HttpService } from '@/_services';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons/faPlusCircle';
import { MimicBackendTournamentInterceptor } from '../_helpers/MimicBackendTournamentInterceptor';

import { TournamentHttpService } from '../_services';

import { TournamentRoundsComponent } from './tournament-rounds.component';
import { PreloadAllModules, provideRouter, withPreloading } from '@angular/router';

describe('TournamentRoundsComponent', () => {
  let component: TournamentRoundsComponent;
  let fixture: ComponentFixture<TournamentRoundsComponent>;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        FontAwesomeModule,
        TournamentRoundsComponent
      ],
      providers: [HttpService,
        { provide: AuthenticationService, useValue: authenticationServiceStub },
        TournamentHttpService,
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendTournamentInterceptor, multi: true },
        provideHttpClient(withInterceptorsFromDi()),
        provideRouter(routing, withPreloading(PreloadAllModules)),
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TournamentRoundsComponent);
    history.pushState({data: {tournament: {id: 1, name: 'test', startDate: '10/10/2020', endDate: '10/10/2020', player: {id: 1}}}}, '');
    component = fixture.componentInstance;
    component.faPlusCircle = faPlusCircle;
    component.tournament = {id: 1, name: 'test', startDate: '2020/10/10', endDate: '2020/10/10'};
    component.rounds = [{course: {name: 'Lisia Polana', par: 72}, roundDate: '10/10/2020',
    matchPlay: false, player: [{nick: 'test', roundDetails: {whs: 10, cr: 68, sr: 133, teeId: 0, teeType: teeTypes.TEE_TYPE_18}}],
    scoreCard: [{hole: 1, stroke: 1, pats: 0}], id: 1}];
  });


  it('should create', () => {
    history.pushState({test: {}}, '');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create and display data', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should add round', () => {
    component.addRound(component.rounds[0]);
    expect(component.rounds.length).toEqual(0);
  });


  afterAll(() => {
    TestBed.resetTestingModule();
  });
});

