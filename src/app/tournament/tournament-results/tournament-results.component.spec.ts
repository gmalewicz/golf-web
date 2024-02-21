import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { routing } from '@/app.routing';
import { alertServiceStub, authenticationServiceStub, MatDialogMock, MyRouterStub } from '@/_helpers/test.helper';
import { AlertService, AuthenticationService, HttpService } from '@/_services';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MimicBackendTournamentInterceptor } from '../_helpers/MimicBackendTournamentInterceptor';
import { TournamentHttpService, TournamentNavigationService } from '../_services';
import { TournamentResultsComponent } from './tournament-results.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TournamentStatus } from '../_models/tournament';
import { Router } from '@angular/router';
import { getTournamentResult, getTournamentResult2 } from '../_helpers/test.helper';

describe('TournamentResultsComponent', () => {

  let component: TournamentResultsComponent;
  let fixture: ComponentFixture<TournamentResultsComponent>;
  const navigationService: TournamentNavigationService = new TournamentNavigationService();

  const standardSetup = () => {
    fixture = TestBed.createComponent(TournamentResultsComponent);
    component = fixture.componentInstance;
    component.navigationService.tournament.set({id: 1, name: 'test', startDate: '10/10/2020', endDate: '10/10/2020', bestRounds: 0, player: {id: 1}});
    fixture.detectChanges();
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        routing,
        ReactiveFormsModule,
        MatDialogModule,
        FontAwesomeModule,
        BrowserAnimationsModule,
        TournamentResultsComponent
      ],
      providers: [HttpService,
                  { provide: AuthenticationService, useValue: authenticationServiceStub },
                  TournamentHttpService,
                  { provide: TournamentNavigationService, useValue: navigationService},
                  { provide: HTTP_INTERCEPTORS, useClass: MimicBackendTournamentInterceptor, multi: true },
                  { provide: MatDialog, useClass: MatDialogMock},
                  { provide: Router, useClass: MyRouterStub },
                  { provide: AlertService, useValue: alertServiceStub }
        ]
    })
    .compileComponents();
  }));


  it('should create without player ', () => {
    spyOnProperty(authenticationServiceStub , 'currentPlayerValue', 'get').and.returnValue(null);
    standardSetup();
    expect(component).toBeTruthy();
  });

  it('should create', () => {
    standardSetup();
    expect(component).toBeTruthy();
  });

  it('should test show Player details with undefined rounds', fakeAsync(() => {
    standardSetup();
    component.showPlayerDetails(getTournamentResult(), 0);
    expect(component.displayRound[0]).toBeTruthy();

  }));

  it('should test hied player details', fakeAsync(() => {
    standardSetup();
    component.displayRound[0] = true;
    component.hidePlayerDetails(0);
    expect(component.displayRound[0]).toBeFalsy();

  }));

  it('should test updateSort with stb net', fakeAsync(() => {
    standardSetup();
    component.navigationService.tournamentResults.set([getTournamentResult(), getTournamentResult2()]);
    component.updateSort(0);
    expect(component.navigationService.tournamentResults()[0].id).toEqual(2);

  }));


  it('should test updateSort with stb gross', fakeAsync(() => {
    standardSetup();
    component.navigationService.tournamentResults.set([getTournamentResult(), getTournamentResult2()]);
    component.updateSort(1);
    expect(component.navigationService.tournamentResults()[0].id).toEqual(2);

  }));

  it('should test updateSort with strokes', fakeAsync(() => {
    standardSetup();
    component.navigationService.tournamentResults.set([getTournamentResult(), getTournamentResult2()]);
    fixture.detectChanges();
    component.updateSort(2);
    expect(component.navigationService.tournamentResults()[0].id).toEqual(1);

  }));

  it('should test updateSort with strokes net', fakeAsync(() => {
    standardSetup();
    component.navigationService.tournamentResults.set([getTournamentResult(), getTournamentResult2()]);
    fixture.detectChanges();
    component.updateSort(3);
    expect(component.navigationService.tournamentResults()[0].id).toEqual(1);

  }));

  it('should test updateSort with strokes net and best round = 1', fakeAsync(() => {
    standardSetup();
    component.navigationService.tournament.set({...component.navigationService.tournament(), bestRounds: 1});
    component.navigationService.tournamentResults.set([getTournamentResult(), getTournamentResult2()]);
    fixture.detectChanges();
    component.updateSort(3);
    expect(component.navigationService.tournamentResults()[0].id).toEqual(1);

  }));

  it('should test delete result', fakeAsync(() => {
    standardSetup();
    component.deleteResult(1);
    expect(component).toBeTruthy();

  }));


  it('should close tournament',  fakeAsync(() => {
    standardSetup();
    component.closeTournament();
    expect(component.navigationService.tournament().status).toBe(TournamentStatus.STATUS_CLOSE);
  }));


  it('should delete tournament',  fakeAsync(() => {
    standardSetup();
    component.deleteTournament();
    expect(component.loadingDelete).toBeTruthy();
  }));

  it('should press cancel',  fakeAsync(() => {
    standardSetup();
    component.onCancel();
    expect(navigationService.teeTimeParameters()).toBeUndefined();
  }));

  it('should displayPDF',  fakeAsync(() => {
    standardSetup();
    component.displayPDF("test");
    expect(component).toBeTruthy();
  }));

  it('should loadComponent 0',  fakeAsync(() => {
    standardSetup();
    component.loadComponent(0);
    expect(component).toBeTruthy();
  }));

  it('should loadComponent 1',  fakeAsync(() => {
    standardSetup();
    component.loadComponent(1);
    expect(component).toBeTruthy();
  }));

  afterAll(() => {
    TestBed.resetTestingModule();
  });

});
