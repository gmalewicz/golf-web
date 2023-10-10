import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LeagueComponent } from './league.component';
import { LeagueHttpService } from '../_services/leagueHttp.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { MatDialogMock, MyRouterStub, alertServiceStub } from '@/_helpers/test.helper';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MimicBackendMpLeaguesInterceptor } from '../_helpers/MimicBackendMpLeaguesInterceptor';
import { HttpService } from '@/_services/http.service';
import { Router } from '@angular/router';
import { AlertService } from '@/_services/alert.service';

describe('LeagueComponent', () => {
  let component: LeagueComponent;
  let fixture: ComponentFixture<LeagueComponent>;
  let currentPlayerValueSpy: jasmine.Spy<jasmine.Func>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LeagueComponent],
      imports: [
        HttpClientModule,
        MatDialogModule,
      ],
      providers: [
        HttpService,
        LeagueHttpService,
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendMpLeaguesInterceptor, multi: true },
        { provide: Router, useClass: MyRouterStub },
        { provide: AlertService, useValue: alertServiceStub },
        { provide: MatDialog, useClass: MatDialogMock},
      ]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeagueComponent);
    component = fixture.componentInstance;
    currentPlayerValueSpy = spyOnProperty(component.authenticationService , 'currentPlayerValue');
    component.navigationService.league.set({id: 1, name: 'test league', status: true, player: {id: 1}});
    component.navigationService.players.set([]);
    component.navigationService.matches.set([]);
  });


  it('should create', () => {
    spyOnProperty(component.authenticationService , 'playerRole').and.returnValue('PLAYER');
    currentPlayerValueSpy.and.returnValue({nick: 'test', id: 1});
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.isLoadingClose()).toBeFalsy();
    expect(component.isLoadingDelete()).toBeFalsy();
  });

  it('should create but player does not exists', () => {
    currentPlayerValueSpy.and.returnValue(null);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should delete league', () => {
    spyOnProperty(component.authenticationService , 'playerRole').and.returnValue('PLAYER');
    currentPlayerValueSpy.and.returnValue({nick: 'test', id: 1});
    fixture.detectChanges();
    component.deleteLeague();
    expect(component.navigationService.league()).toBeUndefined();
  });

  it('should close league', () => {
    spyOnProperty(component.authenticationService , 'playerRole').and.returnValue('PLAYER');
    currentPlayerValueSpy.and.returnValue({nick: 'test', id: 1});
    fixture.detectChanges();
    component.closeLeague();
    expect(component.navigationService.league().status).toBeTruthy();
  });

  it('should update nicks', () => {
    spyOnProperty(component.authenticationService , 'playerRole').and.returnValue('PLAYER');
    currentPlayerValueSpy.and.returnValue({nick: 'test', id: 1});
    component.navigationService.players.set([{id: 1, playerId: 1, nick: 'Test 1', league: {id: 1, name: 'test league', status: true, player: {id: 1}}},
                                             {id: 2, playerId: 2, nick: 'Test 2', league: {id: 1, name: 'test league', status: true, player: {id: 1}}}]);
    component.navigationService.matches.set([{id: 1, winnerId: 1, looserId: 2, league: {id: 1, name: 'test league', status: true, player: {id: 1}}, result: 'A/S'}]);
    fixture.detectChanges();
    component.updateNicks();
    expect(component.navigationService.matches()[0].winnerNick).toBe('Test 1');
  });
});
