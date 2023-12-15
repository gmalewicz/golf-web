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
  const dialog = new MatDialogMock();

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
        { provide: MatDialog, useValue: dialog},
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendTournamentInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TournamentPlayersComponent);
    component = fixture.componentInstance;
    component.tournament = {id: 1, name: 'test', startDate: '10/10/2020', endDate: '10/10/2020'};

  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create where tournamentPlayers are defined', () => {
    component.tournamentPlayers = [];
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should delete existing player without results', () => {
    fixture.detectChanges();
    component.tournamentResults = [];
    component.tournamentPlayers = [getTournamentPlayer()];
    component.deletePlayer(getTournamentPlayer(), 0);
    expect(component.tournamentPlayers.length).toBe(0);
  });

  it('should try to delete player with results', () => {
    fixture.detectChanges();
    component.tournamentPlayers = [getTournamentPlayer()];
    component.tournamentResults = [getTournamentResult()];
    component.deletePlayer(getTournamentPlayer(), 0);
    expect(component.tournamentPlayers.length).toBe(1);
  });

  it('should search player and player found', () => {
    fixture.detectChanges();
    component.onSearchPlayer(undefined);
    expect(component).toBeTruthy();
  });

  it('should search player but action has ben cancelled', () => {
    dialog.setRetVal(undefined);
    fixture.detectChanges();
    component.onSearchPlayer(undefined);
    expect(component).toBeTruthy();
  });

  it('should search player but creation of the new player has been selected', () => {
    dialog.setRetVal({nick: 'Player', female: true, whs: 10.1, action: 'new'});
    fixture.detectChanges();
    component.onSearchPlayer(undefined);
    expect(component).toBeTruthy();
  });

  it('should not add player because the player already exists', () => {
    dialog.setRetVal({nick: 'test', female: true, whs: 10.1});
    component.tournamentPlayers = [getTournamentPlayer()];
    fixture.detectChanges();
    component.onSearchPlayer(undefined);
    expect(component).toBeTruthy();
  });

  it('should update WHS', () => {
    dialog.setRetVal({nick: 'Player', female: true, whs: 10.1});
    fixture.detectChanges();
    component.tournamentPlayers = [getTournamentPlayer()];
    component.tournamentResults = [];
    component.updateWHS(0);
    expect(component.tournamentPlayers.at(0).whs).toBe(10.1);
  });

  it('should not update WHS because player has results', () => {
    dialog.setRetVal({nick: 'Player', female: true, whs: 10.1});
    fixture.detectChanges();
    component.tournamentPlayers = [getTournamentPlayer()];
    component.tournamentResults = [getTournamentResult()];
    component.updateWHS(0);
    expect(component.tournamentPlayers.at(0).whs).toBe(10);
  });
});
