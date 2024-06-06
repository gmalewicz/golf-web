import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LeaguePlayerComponent } from './league-player.component';
import { LeagueHttpService } from '../_services/leagueHttp.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthenticationService } from '@/_services/authentication.service';
import { MatDialogMock, authenticationServiceStub } from '@/_helpers/test.helper';
import { HttpService } from '@/_services/http.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { MimicBackendMpLeaguesInterceptor } from '../_helpers/MimicBackendMpLeaguesInterceptor';

describe('LeaguePlayerComponent', () => {
  let component: LeaguePlayerComponent;
  let fixture: ComponentFixture<LeaguePlayerComponent>;
  const dialog = new MatDialogMock();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LeaguePlayerComponent,
                HttpClientModule,
                MatDialogModule,
      ],
      providers: [HttpService,
                  LeagueHttpService,
                  { provide: AuthenticationService, useValue: authenticationServiceStub},
                  { provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true },
                  { provide: HTTP_INTERCEPTORS, useClass: MimicBackendMpLeaguesInterceptor, multi: true },
                  { provide: MatDialog, useValue: dialog},
      ]
    });
    fixture = TestBed.createComponent(LeaguePlayerComponent);
    component = fixture.componentInstance;
    component.navigationService.league.set({id: 1, name: 'test league', status: true, player: {id: 1}});
    component.navigationService.players.set([]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
    component.navigationService.players.set([{id: 1, playerId: 1, nick: 'test', league: {id: 1, name: 'test league', status: true, player: {id: 1}}}]);
    fixture.detectChanges();
    component.onSearchPlayer(undefined);
    expect(component).toBeTruthy();
  });

  it('should delete player but he has match associated with', () => {
    component.navigationService.players.set([{id: 1, playerId: 1, nick: 'Test 1', league: {id: 1, name: 'test league', status: true, player: {id: 1}}},
                                             {id: 2, playerId: 2, nick: 'Test 2', league: {id: 1, name: 'test league', status: true, player: {id: 1}}}]);
    component.navigationService.matches.set([{id: 1, winnerId: 1, looserId: 2, league: {id: 1, name: 'test league', status: true, player: {id: 1}}, result: 'A/S'}]);

    component.deletePlayer({id: 1, playerId: 1, nick: 'Test 1', league: {id: 1, name: 'test league', status: true, player: {id: 1}}}, 1);
    expect(component.navigationService.players().length).toBe(2);
  });

  it('should delete player', () => {
    component.navigationService.players.set([{id: 1, playerId: 1, nick: 'Test 1', league: {id: 1, name: 'test league', status: true, player: {id: 1}}},
                                             {id: 2, playerId: 2, nick: 'Test 2', league: {id: 1, name: 'test league', status: true, player: {id: 1}}}]);

    component.deletePlayer({id: 1, playerId: 1, nick: 'Test 1', league: {id: 1, name: 'test league', status: true, player: {id: 1}}}, 1);
    expect(component.navigationService.players().length).toBe(1);
  });

});
