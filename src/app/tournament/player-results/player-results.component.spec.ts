/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerResultsComponent } from './player-results.component';
import { TournamentHttpService } from '../_services/tournamentHttp.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MimicBackendTournamentInterceptor } from '../_helpers/MimicBackendTournamentInterceptor';
import { Router } from '@angular/router';

describe('PlayerResultsComponent', () => {
  let component: PlayerResultsComponent;
  let fixture: ComponentFixture<PlayerResultsComponent>;

  class RouterStub {
    routerState = { root: '' };
    navigate() {
      return;
    }
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayerResultsComponent ],
      imports: [
        HttpClientModule,
      ],
      providers: [
        TournamentHttpService,
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendTournamentInterceptor, multi: true },
        { provide: Router, useClass: RouterStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerResultsComponent);
    component = fixture.componentInstance;
    component.tournamentResult = {id: 1, playedRounds: 1, strokesBrutto: 1, strokesNetto: 1, stbNet: 1, stbGross: 1, strokeRounds: 1};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should showPlayerRound', () => {
    component.showPlayerRound(1);
    expect(component).toBeTruthy();
  });
});
