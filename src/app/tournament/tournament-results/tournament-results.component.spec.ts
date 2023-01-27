import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { routing } from '@/app.routing';
import { alertServiceStub, authenticationServiceStub, MatDialogMock, MyRouterStub } from '@/_helpers/test.helper';
import { AlertService, AuthenticationService, HttpService } from '@/_services';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MimicBackendTournamentInterceptor } from '../_helpers/MimicBackendTournamentInterceptor';
import { TournamentHttpService } from '../_services';
import { TournamentResultsComponent } from './tournament-results.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TournamentStatus } from '../_models/tournament';
import { Router } from '@angular/router';
import { getTournamentResult, getTournamentResult2 } from '../_helpers/test.helper';

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
        MatDialogModule,
        FontAwesomeModule,
        BrowserAnimationsModule
      ],
      providers: [HttpService,
                  { provide: AuthenticationService, useValue: authenticationServiceStub },
                  TournamentHttpService,
                  { provide: HTTP_INTERCEPTORS, useClass: MimicBackendTournamentInterceptor, multi: true },
                  { provide: MatDialog, useClass: MatDialogMock},
                  { provide: Router, useClass: MyRouterStub },
                  { provide: AlertService, useValue: alertServiceStub }
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    history.pushState({data:
        {tournament: {id: 1, name: 'test', startDate: '10/10/2020', endDate: '10/10/2020', bestRounds: 0, player: {id: 1}}}}, '');
    fixture = TestBed.createComponent(TournamentResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create without player ', () => {

    fixture = TestBed.createComponent(TournamentResultsComponent);
    history.pushState({data: undefined}, '');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should test show Player details with undefined rounds', fakeAsync(() => {

    component.showPlayerDetails(getTournamentResult(), 0);
    expect(component.displayRound[0]).toBeTruthy();

  }));

  it('should test hied player details', fakeAsync(() => {

    component.displayRound[0] = true;
    component.hidePlayerDetails(0);
    expect(component.displayRound[0]).toBeFalsy();

  }));

  it('should test updateSort with stb net', fakeAsync(() => {

    component.tournamentResults.push(getTournamentResult());
    component.tournamentResults.push(getTournamentResult2());
    component.updateSort(0);
    expect(component.tournamentResults[0].id).toEqual(2);

  }));


  it('should test updateSort with stb gross', fakeAsync(() => {

    component.tournamentResults.push(getTournamentResult());
    component.tournamentResults.push(getTournamentResult2());
    component.updateSort(1);
    expect(component.tournamentResults[0].id).toEqual(2);

  }));

  it('should test updateSort with strokes', fakeAsync(() => {

    component.tournamentResults.push(getTournamentResult());
    component.tournamentResults.push(getTournamentResult2());
    fixture.detectChanges();
    component.updateSort(2);
    expect(component.tournamentResults[0].id).toEqual(1);

  }));

  it('should test updateSort with strokes net', fakeAsync(() => {

    component.tournamentResults.push(getTournamentResult());
    component.tournamentResults.push(getTournamentResult2());
    fixture.detectChanges();
    component.updateSort(3);
    expect(component.tournamentResults[0].id).toEqual(1);

  }));

  it('should test updateSort with strokes net and best round = 1', fakeAsync(() => {

    component.tournament.bestRounds = 1;
    component.tournamentResults.push(getTournamentResult());
    component.tournamentResults.push(getTournamentResult2());
    fixture.detectChanges();
    component.updateSort(3);
    expect(component.tournamentResults[0].id).toEqual(1);

  }));

  it('should test delete result', fakeAsync(() => {

    component.deleteResult(1);
    expect(component).toBeTruthy();

  }));


  it('should close tournament',  fakeAsync(() => {

    component.closeTournament();
    expect(component.tournament.status).toBe(TournamentStatus.STATUS_CLOSE);
  }));


  it('should delete tournament',  fakeAsync(() => {

    component.deleteTournament();
    expect(component.loadingDelete).toBeTruthy();
  }));

  afterAll(() => {
    TestBed.resetTestingModule();
  });

});
