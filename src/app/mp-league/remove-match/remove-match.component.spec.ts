import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RemoveMatchComponent } from './remove-match.component';
import { LeagueHttpService } from '../_services/leagueHttp.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { HttpService } from '@/_services/http.service';
import { MimicBackendMpLeaguesInterceptor } from '../_helpers/MimicBackendMpLeaguesInterceptor';
import { Router } from '@angular/router';
import { MyRouterStub, alertServiceStub } from '@/_helpers/test.helper';
import { AlertService } from '@/_services/alert.service';

describe('RemoveMatchComponent', () => {
  let component: RemoveMatchComponent;
  let fixture: ComponentFixture<RemoveMatchComponent>;
  let currentPlayerValueSpy: jasmine.Spy<jasmine.Func>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RemoveMatchComponent],
      imports: [
        HttpClientModule,
        ReactiveFormsModule,
        DropdownModule,
      ],
      providers: [ LeagueHttpService,
                   HttpService,
                   { provide: HTTP_INTERCEPTORS, useClass: MimicBackendMpLeaguesInterceptor, multi: true },
                   { provide: Router, useClass: MyRouterStub },
                   { provide: AlertService, useValue: alertServiceStub },
]
    });
    fixture = TestBed.createComponent(RemoveMatchComponent);
    component = fixture.componentInstance;
    currentPlayerValueSpy = spyOnProperty(component.authenticationService , 'currentPlayerValue');
    component.navigationService.league.set({id: 1, name: 'test league', status: true});
  });

  it('should create', () => {
    spyOnProperty(component.authenticationService , 'playerRole').and.returnValue('PLAYER');
    currentPlayerValueSpy.and.returnValue({nick: 'test', id: 1});
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create but player does not exists', () => {
    currentPlayerValueSpy.and.returnValue(null);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should remove match but form is invalid', () => {
    spyOnProperty(component.authenticationService , 'playerRole').and.returnValue('PLAYER');
    currentPlayerValueSpy.and.returnValue({nick: 'test', id: 1});
    fixture.detectChanges();
    component.removeMatchResult();
    expect(component.isSubmitted()).toBeTruthy();
  });

  it('should remove match but players are the same', () => {
    spyOnProperty(component.authenticationService , 'playerRole').and.returnValue('PLAYER');
    currentPlayerValueSpy.and.returnValue({nick: 'test', id: 1});
    component.navigationService.players.set([{id: 1, playerId: 1, nick: 'Test 1', league: {id: 1, name: 'test league', status: true, player: {id: 1}}},
                                             {id: 2, playerId: 2, nick: 'Test 2', league: {id: 1, name: 'test league', status: true, player: {id: 1}}}]);
    fixture.detectChanges();
    component.f.winnerDropDown.setValue(1);
    component.f.looserDropDown.setValue(1);
    component.removeMatchResult();
    expect(component.isSubmitted()).toBeTruthy();
  });

  it('should remove match but it does not exist', () => {
    spyOnProperty(component.authenticationService , 'playerRole').and.returnValue('PLAYER');
    currentPlayerValueSpy.and.returnValue({nick: 'test', id: 1});
    component.navigationService.players.set([{id: 1, playerId: 1, nick: 'Test 1', league: {id: 1, name: 'test league', status: true, player: {id: 1}}},
                                             {id: 2, playerId: 2, nick: 'Test 2', league: {id: 1, name: 'test league', status: true, player: {id: 1}}}]);
    fixture.detectChanges();
    component.f.winnerDropDown.setValue(1);
    component.f.looserDropDown.setValue(2);
    component.removeMatchResult();
    expect(component.isSubmitted()).toBeTruthy();
  });

  it('should remove match properly', () => {
    spyOnProperty(component.authenticationService , 'playerRole').and.returnValue('PLAYER');
    currentPlayerValueSpy.and.returnValue({nick: 'test', id: 1});
    component.navigationService.players.set([{id: 1, playerId: 1, nick: 'Test 1', league: {id: 1, name: 'test league', status: true, player: {id: 1}}},
                                             {id: 2, playerId: 2, nick: 'Test 2', league: {id: 1, name: 'test league', status: true, player: {id: 1}}}]);
    component.navigationService.matches.set([{id: 1, winnerId: 1, looserId: 2, league: {id: 1, name: 'test league', status: true, player: {id: 1}}, result: 'A/S'}]);
    fixture.detectChanges();
    component.f.winnerDropDown.setValue(1);
    component.f.looserDropDown.setValue(2);
    component.removeMatchResult();
    expect(component.navigationService.matches().length).toBe(0);
  });

  it('should execute clear', () => {
    currentPlayerValueSpy.and.returnValue({nick: 'test', id: 1});
    component.navigationService.players.set([{id: 1, playerId: 1, nick: 'Test 1', league: {id: 1, name: 'test league', status: true, player: {id: 1}}},
                                             {id: 2, playerId: 2, nick: 'Test 2', league: {id: 1, name: 'test league', status: true, player: {id: 1}}}]);
    fixture.detectChanges();
    component.f.winnerDropDown.setValue(1);
    component.clear();
    expect(component.f.winnerDropDown.value).toBeUndefined();
  });

  it('should execute onChange', () => {
    currentPlayerValueSpy.and.returnValue({nick: 'test', id: 1});
    component.navigationService.players.set([{id: 1, playerId: 1, nick: 'Test 1', league: {id: 1, name: 'test league', status: true, player: {id: 1}}},
                                             {id: 2, playerId: 2, nick: 'Test 2', league: {id: 1, name: 'test league', status: true, player: {id: 1}}}]);
    fixture.detectChanges();
    component.onChange();
    expect(component).toBeTruthy();
  });

});
