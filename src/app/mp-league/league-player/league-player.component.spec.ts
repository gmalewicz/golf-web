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
                  { provide: MatDialog, useClass: MatDialogMock},
      ]
    });
    fixture = TestBed.createComponent(LeaguePlayerComponent);
    component = fixture.componentInstance;
    component.navigationService.league.set({id: 1, name: 'test league', status: true, player: {id: 1}});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.isSearchPlayerInProgress()).toBeFalsy();
  });

  it('should search player but form is invalid', () => {
    component.onSearchPlayer();
    expect(component.isSubmitted()).toBeTruthy();
  });

  it('should search player but he is already added to the tournamnet', () => {
    component.navigationService.players.set([{id: 1, playerId: 1, nick: 'Test 1', league: {id: 1, name: 'test league', status: true, player: {id: 1}}}]);
    component.f.nick.setValue('Test 1');
    component.onSearchPlayer();
    expect(component.isSubmitted()).toBeFalsy();
  });

  it('should search add player', () => {
    component.navigationService.players.set([{id: 1, playerId: 1, nick: 'Test 1', league: {id: 1, name: 'test league', status: true, player: {id: 1}}}]);
    component.f.nick.setValue('Other2');
    component.onSearchPlayer();
    expect(component.navigationService.players().length).toBe(2);
  });

  it('should search add player but id does not exists', () => {
    component.navigationService.players.set([{id: 1, playerId: 1, nick: 'Test 1', league: {id: 1, name: 'test league', status: true, player: {id: 1}}}]);
    component.f.nick.setValue('Other3');
    component.onSearchPlayer();
    expect(component.navigationService.players().length).toBe(1);
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
