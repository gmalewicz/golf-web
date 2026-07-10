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
import { HttpService } from '@/_services/http.service';
import { TeeColourPipe, TeeNamePipe } from '../_helpers/tee.pipe';
import { TournamentRound } from '../_models/tournamentRound';
import { of } from 'rxjs';

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
          HttpService,
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
    expect(new TeeNamePipe().transform(undefined)).toBe('-');
  });

  it('should getTeeName return dash when tee is empty string', () => {
    expect(new TeeNamePipe().transform('')).toBe('-');
  });

  it('should getTeeName return tee name as-is', () => {
    expect(new TeeNamePipe().transform('Yellow')).toBe('Yellow');
  });

  it('should getTeeName return tee name with multiple words as-is', () => {
    expect(new TeeNamePipe().transform('Red Extra')).toBe('Red Extra');
  });

  it('should getTeeColour return null when tee is undefined', () => {
    expect(new TeeColourPipe().transform(undefined)).toBeNull();
  });

  it('should getTeeColour return colour when tee name matches known colour', () => {
    expect(new TeeColourPipe().transform('Yellow')).toBe('yellow');
    expect(new TeeColourPipe().transform('Red')).toBe('red');
    expect(new TeeColourPipe().transform('Blue')).toBe('blue');
    expect(new TeeColourPipe().transform('White')).toBe('white');
  });

  it('should getTeeColour return colour for black tee', () => {
    expect(new TeeColourPipe().transform('Black')).toBe('black');
  });

  it('should initialize faPencil icon in ngOnInit', () => {
    component.tournamentNavigationService.tournament.set({id: 1, name: 'test', startDate: '10/10/2020', endDate: '10/10/2020', bestRounds: 0, playHcpMultiplayer: 1, player: {id: 1}});
    fixture.detectChanges();
    expect(component.faPencil).toBeDefined();
  });

  it('should showPlayerRound pass tournamentRound flag in navigation state', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    component.tournamentNavigationService.tournament.set({id: 1, name: 'test', startDate: '10/10/2020', endDate: '10/10/2020', bestRounds: 0, playHcpMultiplayer: 1, player: {id: 1}});
    fixture.detectChanges();

    component.showPlayerRound(1);

    const navigateArgs = (router.navigate as jasmine.Spy).calls.mostRecent().args;
    expect(navigateArgs[0][0]).toBe('/round/');
    expect(navigateArgs[1].state.data.tournamentRound).toBeTrue();
  });

  it('should deleteRound emit notify event', () => {
    component.tournamentNavigationService.tournament.set({id: 1, name: 'test', startDate: '10/10/2020', endDate: '10/10/2020', bestRounds: 0, playHcpMultiplayer: 1, player: {id: 1}});
    fixture.detectChanges();

    spyOn(component.notify, 'emit');
    component.deleteRound(1);

    expect(component.notify.emit).toHaveBeenCalled();
  });

  it('should editRound navigate to addScorecard with tournament edit context', () => {
    const tournamentHttpService = TestBed.inject(TournamentHttpService);
    const httpService = TestBed.inject(HttpService);
    const router = TestBed.inject(Router);

    const mockRound = {
      id: 1,
      course: {id: 1, name: 'TestCourse', par: 72},
      player: [],
      scoreCard: [],
      roundDate: '2020/10/10 10:00',
      format: 0
    };
    const mockScoreCards = [
      {hole: 1, stroke: 4, pats: 0, player: {id: 2, nick: 'TestPlayer'}},
      {hole: 2, stroke: 3, pats: 1, player: {id: 3, nick: 'OtherPlayer'}}
    ];

    spyOn(tournamentHttpService, 'getRound').and.returnValue(of(mockRound as any));
    spyOn(httpService, 'getScoreCards').and.returnValue(of(mockScoreCards as any));
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    componentRef.setInput('tournamentResult', {
      id: 5,
      playedRounds: 1,
      strokesBrutto: 72,
      strokesNetto: 65,
      stbNet: 36,
      stbGross: 30,
      strokeRounds: 1,
      player: {id: 2, nick: 'TestPlayer', sex: false}
    });
    component.tournamentNavigationService.tournament.set({
      id: 3, name: 'TestTournament', startDate: '10/10/2020', endDate: '10/10/2020',
      bestRounds: 0, playHcpMultiplayer: 1, player: {id: 1}
    });
    fixture.detectChanges();

    const tournamentRound: TournamentRound = {
      id: 10, roundId: 1, courseName: 'TestCourse', scrDiff: 1,
      stbGross: 30, stbNet: 36, strokesBrutto: 72, strokesNetto: 65,
      strokes: true, playingHcp: 7, hcp: 28.5, courseHcp: 7
    };

    component.editRound(tournamentRound);

    expect(tournamentHttpService.getRound).toHaveBeenCalledWith(1);
    expect(httpService.getScoreCards).toHaveBeenCalledWith(1);
    expect(router.navigate).toHaveBeenCalled();

    const navigateArgs = (router.navigate as jasmine.Spy).calls.mostRecent().args;
    expect(navigateArgs[0][0]).toBe('/addScorecard/1/TestCourse/72');
    expect(navigateArgs[1].state.data.tournamentEdit.tournamentResultId).toBe(5);
    expect(navigateArgs[1].state.data.tournamentEdit.tournamentId).toBe(3);
    expect(navigateArgs[1].state.data.tournamentEdit.playerId).toBe(2);
    expect(navigateArgs[1].state.data.tournamentEdit.playerSex).toBeFalse();
  });

  it('should editRound filter scoreCards to current player only', () => {
    const tournamentHttpService = TestBed.inject(TournamentHttpService);
    const httpService = TestBed.inject(HttpService);
    const router = TestBed.inject(Router);

    const mockRound = {
      id: 1, course: {id: 1, name: 'Course', par: 72}, player: [], scoreCard: [], roundDate: '2020/10/10', format: 0
    };
    const mockScoreCards = [
      {hole: 1, stroke: 5, pats: 1, player: {id: 2, nick: 'TestPlayer'}},
      {hole: 1, stroke: 3, pats: 0, player: {id: 7, nick: 'OtherPlayer'}}
    ];

    spyOn(tournamentHttpService, 'getRound').and.returnValue(of(mockRound as any));
    spyOn(httpService, 'getScoreCards').and.returnValue(of(mockScoreCards as any));
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    componentRef.setInput('tournamentResult', {
      id: 5, playedRounds: 1, strokesBrutto: 72, strokesNetto: 65,
      stbNet: 36, stbGross: 30, strokeRounds: 1,
      player: {id: 2, nick: 'TestPlayer', sex: false}
    });
    component.tournamentNavigationService.tournament.set({
      id: 3, name: 'TestTournament', startDate: '10/10/2020', endDate: '10/10/2020',
      bestRounds: 0, playHcpMultiplayer: 1, player: {id: 1}
    });
    fixture.detectChanges();

    component.editRound({
      id: 10, roundId: 1, courseName: 'Course', scrDiff: 1,
      stbGross: 30, stbNet: 36, strokesBrutto: 72, strokesNetto: 65,
      strokes: true, playingHcp: 7, hcp: 28.5, courseHcp: 7
    });

    const navigateArgs = (router.navigate as jasmine.Spy).calls.mostRecent().args;
    const passedRound = navigateArgs[1].state.data.round;
    expect(passedRound.scoreCard).toHaveSize(1)
    expect(passedRound.scoreCard[0].player.id).toBe(2);
  });

});
