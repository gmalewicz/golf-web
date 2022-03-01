import { TournamentResult } from './../_models/tournamentResult';
import { routing } from '@/app.routing';
import { authenticationServiceStub } from '@/_helpers/test.helper';
import { AuthenticationService, HttpService } from '@/_services';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MimicBackendTournamentInterceptor } from '../_helpers/MimicBackendTournamentInterceptor';
import { TournamentHttpService } from '../_services';

import { TournamentResultsComponent } from './tournament-results.component';

describe('TournamentResultsComponent', () => {

  let component: TournamentResultsComponent;
  let fixture: ComponentFixture<TournamentResultsComponent>;

  const tournamentResult1: TournamentResult = {
    id: 1,
    playedRounds: 1,
    player: {id: 1},
    strokesBrutto: 1,
    strokesNetto: 1,
    stbNet: 1,
    stbGross: 1,
    strokeRounds: 1,
  };

  const tournamentResult2: TournamentResult = {
    id: 2,
    playedRounds: 1,
    player: {id: 1},
    strokesBrutto: 2,
    strokesNetto: 2,
    stbNet: 2,
    stbGross: 2,
    strokeRounds: 1
  };

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

    component.showPlayerDetails(tournamentResult1, 0);
    expect(component.displayRound[0]).toBeTruthy();

  }));

  it('should test hied player details', fakeAsync(() => {

    component.displayRound[0] = true;
    component.hidePlayerDetails(0);
    expect(component.displayRound[0]).toBeFalsy();

  }));

  it('should test updateSort with stb net', fakeAsync(() => {

    component.tournamentResults.push(tournamentResult1);
    component.tournamentResults.push(tournamentResult2);
    component.updateSort(0);
    expect(component.tournamentResults[0].id).toEqual(2);

  }));


  it('should test updateSort with stb gross', fakeAsync(() => {

    component.tournamentResults.push(tournamentResult1);
    component.tournamentResults.push(tournamentResult2);
    component.updateSort(1);
    expect(component.tournamentResults[0].id).toEqual(2);

  }));

  it('should test updateSort with strokes', fakeAsync(() => {

    component.tournamentResults.push(tournamentResult1);
    component.tournamentResults.push(tournamentResult2);
    fixture.detectChanges();
    component.updateSort(2);
    expect(component.tournamentResults[0].id).toEqual(1);

  }));

  it('should test updateSort with strokes net', fakeAsync(() => {

    component.tournamentResults.push(tournamentResult1);
    component.tournamentResults.push(tournamentResult2);
    fixture.detectChanges();
    component.updateSort(3);
    expect(component.tournamentResults[0].id).toEqual(1);

  }));

  it('should test updateSort with strokes net and best round = 1', fakeAsync(() => {

    component.tournament.bestRounds = 1;
    component.tournamentResults.push(tournamentResult1);
    component.tournamentResults.push(tournamentResult2);
    fixture.detectChanges();
    component.updateSort(3);
    expect(component.tournamentResults[0].id).toEqual(1);

  }));

  afterAll(() => {
    TestBed.resetTestingModule();
  });

});
