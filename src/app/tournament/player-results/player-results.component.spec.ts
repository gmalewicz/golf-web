import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PlayerResultsComponent } from './player-results.component';
import { TournamentHttpService } from '../_services/tournamentHttp.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MimicBackendTournamentInterceptor } from '../_helpers/MimicBackendTournamentInterceptor';
import { Router } from '@angular/router';
import { MyRouterStub } from '@/_helpers/test.helper';

describe('PlayerResultsComponent', () => {
  let component: PlayerResultsComponent;
  let fixture: ComponentFixture<PlayerResultsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayerResultsComponent ],
      imports: [
        HttpClientModule,
      ],
      providers: [
        TournamentHttpService,
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendTournamentInterceptor, multi: true },
        { provide: Router, useClass: MyRouterStub }
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
