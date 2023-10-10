import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddMatchComponent } from './add-match.component';
import { LeagueHttpService } from '../_services/leagueHttp.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { MyRouterStub, alertServiceStub } from '@/_helpers/test.helper';
import { ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { AlertService } from '@/_services/alert.service';
import { HttpService } from '@/_services/http.service';
import { Router } from '@angular/router';
import { MimicBackendMpLeaguesInterceptor } from '../_helpers/MimicBackendMpLeaguesInterceptor';

describe('AddMatchComponent', () => {
  let component: AddMatchComponent;
  let fixture: ComponentFixture<AddMatchComponent>;
  let currentPlayerValueSpy: jasmine.Spy<jasmine.Func>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddMatchComponent],
      imports: [
        HttpClientModule,
        ReactiveFormsModule,
        DropdownModule,
      ],
      providers: [HttpService,
                  LeagueHttpService,
                  { provide: AlertService, useValue: alertServiceStub },
                  { provide: Router, useClass: MyRouterStub },
                  { provide: HTTP_INTERCEPTORS, useClass: MimicBackendMpLeaguesInterceptor, multi: true },
      ]
    });
    fixture = TestBed.createComponent(AddMatchComponent);
    component = fixture.componentInstance;
    currentPlayerValueSpy = spyOnProperty(component.authenticationService , 'currentPlayerValue');
    component.navigationService.league.set({id: 1, name: 'test league', status: true});
  });

  it('should create', () => {
    currentPlayerValueSpy.and.returnValue({nick: 'test', id: 1});
    component.navigationService.players.set([{id: 1, playerId: 1, nick: 'Test 1', league: {id: 1, name: 'test league', status: true, player: {id: 1}}},
                                             {id: 2, playerId: 2, nick: 'Test 2', league: {id: 1, name: 'test league', status: true, player: {id: 1}}}]);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create but player does not exists', () => {
    currentPlayerValueSpy.and.returnValue(null);
    fixture.detectChanges();
    expect(component).toBeTruthy();
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

  it('should add match result with invalid form', () => {
    currentPlayerValueSpy.and.returnValue({nick: 'test', id: 1});
    component.navigationService.players.set([{id: 1, playerId: 1, nick: 'Test 1', league: {id: 1, name: 'test league', status: true, player: {id: 1}}},
                                             {id: 2, playerId: 2, nick: 'Test 2', league: {id: 1, name: 'test league', status: true, player: {id: 1}}}]);
    fixture.detectChanges();
    component.addMatchResult();
    expect(component.navigationService.matches.length).toBe(0);
  });

  it('should add match result with the same users', () => {
    currentPlayerValueSpy.and.returnValue({nick: 'test', id: 1});
    component.navigationService.players.set([{id: 1, playerId: 1, nick: 'Test 1', league: {id: 1, name: 'test league', status: true, player: {id: 1}}},
                                             {id: 2, playerId: 2, nick: 'Test 2', league: {id: 1, name: 'test league', status: true, player: {id: 1}}}]);
    fixture.detectChanges();
    component.f.winnerDropDown.setValue(1);
    component.f.looserDropDown.setValue(1);
    component.f.resultDropDown.setValue('A/S');
    component.addMatchResult();
    expect(component.navigationService.matches().length).toBe(0);
  });

  it('should add match result with the different users', () => {
    currentPlayerValueSpy.and.returnValue({nick: 'test', id: 1});
    component.navigationService.players.set([{id: 1, playerId: 1, nick: 'Test 1', league: {id: 1, name: 'test league', status: true, player: {id: 1}}},
                                             {id: 2, playerId: 2, nick: 'Test 2', league: {id: 1, name: 'test league', status: true, player: {id: 1}}}]);
    fixture.detectChanges();
    component.f.winnerDropDown.setValue(1);
    component.f.looserDropDown.setValue(2);
    component.f.resultDropDown.setValue('A/S');
    component.addMatchResult();
    expect(component.navigationService.matches().length).toBe(1);
  });

});
