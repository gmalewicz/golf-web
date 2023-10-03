import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { MatDialogMock } from '@/_helpers/test.helper';
import { HttpService } from '@/_services/http.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MimicBackendTournamentInterceptor } from '../_helpers/MimicBackendTournamentInterceptor';
import { getTournamentPlayer, getTournamentResult } from '../_helpers/test.helper';
import { TournamentHttpService } from '../_services/tournamentHttp.service';

import { TournamentPlayersComponent } from './tournament-players.component';

describe('TournamentPlayersComponent', () => {
  let component: TournamentPlayersComponent;
  let fixture: ComponentFixture<TournamentPlayersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TournamentPlayersComponent,
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
    component.tournamentPlayers = [getTournamentPlayer()];
    component.deletePlayer(getTournamentPlayer(), 0);
    expect(component.tournamentPlayers.length).toBe(0);
  });

  it('should try to delete player with results', () => {

    component.tournamentPlayers = [getTournamentPlayer()];
    component.tournamentResults = [getTournamentResult()];
    component.deletePlayer(getTournamentPlayer(), 0);
    expect(component.tournamentPlayers.length).toBe(1);
  });

  it('should search player with invalid form', () => {

    component.onSearchPlayer();
    expect(component.submitted).toBeTruthy();
  });

  it('should search for player already added to tournament', () => {

    component.tournamentPlayers = [getTournamentPlayer()];
    component.f.nick.setValue('test');
    component.onSearchPlayer();
    expect(component.submitted).toBeFalsy();
  });

  it('should search for player and add it to tournament', () => {

    component.tournamentPlayers = [getTournamentPlayer()];
    component.f.nick.setValue('Other2');
    component.onSearchPlayer();
    expect(component.tournamentPlayers.length).toBe(2);
  });

  it('should search for player and not found it', () => {

    component.tournamentPlayers = [getTournamentPlayer()];
    component.f.nick.setValue('Other3');
    component.onSearchPlayer();
    expect(component.tournamentPlayers.length).toBe(1);
  });

  it('should update WHS', () => {

    component.tournamentPlayers = [getTournamentPlayer()];
    component.tournamentResults = [];
    component.updateWHS(0);
    expect(component.tournamentPlayers.at(0).whs).toBe(10.1);
  });

});
