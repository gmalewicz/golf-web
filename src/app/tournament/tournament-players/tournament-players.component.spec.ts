import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { HttpService } from '@/_services/http.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { of } from 'rxjs';
import { MimicBackendTournamentInterceptor } from '../_helpers/MimicBackendTournamentInterceptor';
import { TournamentPlayer } from '../_models/tournamentPlayer';
import { TournamentResult } from '../_models/tournamentResult';
import { TournamentHttpService } from '../_services/tournamentHttp.service';

import { TournamentPlayersComponent } from './tournament-players.component';

describe('TournamentPlayersComponent', () => {
  let component: TournamentPlayersComponent;
  let fixture: ComponentFixture<TournamentPlayersComponent>;

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

  const tournamentPlayer: TournamentPlayer = {
    id: 1,
    playerId: 1,
    nick: 'test',
    whs: 10.0,
    tournamentId: 1
  };

  class MatDialogMock {

    open() {
      return {
        afterClosed: () => of(true),
        componentInstance: {confirmMessage: ''}
      };
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TournamentPlayersComponent ],
      imports: [
        HttpClientModule,
        CommonModule,
        ReactiveFormsModule,
        FontAwesomeModule
      ],
      providers: [
        HttpService,
        TournamentHttpService,
        { provide: MatDialog, useClass: MatDialogMock},
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendTournamentInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TournamentPlayersComponent);
    component = fixture.componentInstance;
    component.tournament = {id: 1, name: 'test', startDate: '10/10/2020', endDate: '10/10/2020'};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should delete existing player without results', () => {

    component.tournamentResults = [];
    component.tournamentPlayers = [tournamentPlayer];
    component.deletePlayer(tournamentPlayer);
    expect(component.tournamentPlayers.length).toBe(0);
  });

  it('should try to delete player with results', () => {

    component.tournamentPlayers = [tournamentPlayer];
    component.tournamentResults = [tournamentResult1];
    component.deletePlayer(tournamentPlayer);
    expect(component.tournamentPlayers.length).toBe(1);
  });

  it('should search player with invalid form', () => {

    component.onSearchPlayer();
    expect(component.submitted).toBeTruthy();
  });

  it('should search for player already added to tournament', () => {

    component.tournamentPlayers = [tournamentPlayer];
    component.f.nick.setValue('test');
    component.onSearchPlayer();
    expect(component.submitted).toBeFalsy();
  });

  it('should search for player and add it to tournament', () => {

    component.tournamentPlayers = [tournamentPlayer];
    component.f.nick.setValue('Other2');
    component.onSearchPlayer();
    expect(component.tournamentPlayers.length).toBe(2);
  });

  it('should search for player and not found it', () => {

    component.tournamentPlayers = [tournamentPlayer];
    component.f.nick.setValue('Other3');
    component.onSearchPlayer();
    expect(component.tournamentPlayers.length).toBe(1);
  });

});
