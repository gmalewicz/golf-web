import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PlayerResultsComponent } from './player-results.component';
import { TournamentHttpService } from '../_services/tournamentHttp.service';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MimicBackendTournamentInterceptor } from '../_helpers/MimicBackendTournamentInterceptor';
import { Router } from '@angular/router';
import { authenticationServiceStub, MyRouterStub } from '@/_helpers/test.helper';
import { ComponentRef } from '@angular/core';
import { TournamentNavigationService } from '../_services/tournamentNavigation.service';
import { AuthenticationService } from '@/_services';

describe('PlayerResultsComponent', () => {
  let component: PlayerResultsComponent;
  let fixture: ComponentFixture<PlayerResultsComponent>;
  let componentRef: ComponentRef<PlayerResultsComponent>;
  const tournamentNavigationService: TournamentNavigationService = new TournamentNavigationService();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PlayerResultsComponent],
      providers: [
          TournamentHttpService,
          { provide: HTTP_INTERCEPTORS, useClass: MimicBackendTournamentInterceptor, multi: true },
          { provide: Router, useClass: MyRouterStub },
          { provide: TournamentNavigationService, useValue: tournamentNavigationService},
          { provide: AuthenticationService, useValue: authenticationServiceStub },
          provideHttpClient(withInterceptorsFromDi()
        )
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerResultsComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('tournamentResult', {id: 1, playedRounds: 1, strokesBrutto: 1, strokesNetto: 1, stbNet: 1, stbGross: 1, strokeRounds: 1});
    
  });

  it('should create', () => {
    component.tournamentNavigationService.tournament.set({id: 1, name: 'test', startDate: '10/10/2020', endDate: '10/10/2020', bestRounds: 0, playHcpMultiplayer: 1, player: {id: 1}});
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should showPlayerRound', () => {
     component.tournamentNavigationService.tournament.set({id: 1, name: 'test', startDate: '10/10/2020', endDate: '10/10/2020', bestRounds: 0, playHcpMultiplayer: 1, player: {id: 1}});
    fixture.detectChanges();
    component.showPlayerRound(1);
    expect(component).toBeTruthy();
  });

   it('should deletePlayerRound', () => {
    component.tournamentNavigationService.tournament.set({id: 1, name: 'test', startDate: '10/10/2020', endDate: '10/10/2020', bestRounds: 0, playHcpMultiplayer: 1, player: {id: 1}});
    fixture.detectChanges();
    component.deleteRound(1);
    expect(component).toBeTruthy();
  });

  it('should getTeeName return dash when tee is undefined', () => {
    expect(component.getTeeName(undefined)).toBe('-');
  });

  it('should getTeeName return dash when tee is empty string', () => {
    expect(component.getTeeName('')).toBe('-');
  });

  it('should getTeeName return name part after the first word', () => {
    expect(component.getTeeName('1 Yellow')).toBe('Yellow');
  });

  it('should getTeeName return joined name when tee has multiple words', () => {
    expect(component.getTeeName('1 Red Extra')).toBe('Red Extra');
  });

  it('should getTeeColour return null when tee is undefined', () => {
    expect(component.getTeeColour(undefined)).toBeNull();
  });

  it('should getTeeColour return colour when tee name matches known colour', () => {
    expect(component.getTeeColour('1 Yellow')).toBe('yellow');
    expect(component.getTeeColour('2 Red')).toBe('red');
    expect(component.getTeeColour('3 Blue')).toBe('blue');
    expect(component.getTeeColour('4 White')).toBe('white');
  });

  it('should getTeeColour return null when tee name does not match known colour', () => {
    expect(component.getTeeColour('1 Black')).toBeNull();
  });
});
