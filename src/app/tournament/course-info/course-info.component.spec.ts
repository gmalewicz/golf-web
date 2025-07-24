import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TournamentHttpService } from '../_services/tournamentHttp.service';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MimicBackendTournamentInterceptor } from '../_helpers/MimicBackendTournamentInterceptor';
import { Router } from '@angular/router';
import { MyRouterStub } from '@/_helpers/test.helper';
import { ComponentRef } from '@angular/core';
import { TournamentNavigationService } from '../_services/tournamentNavigation.service';
import { CourseInfoComponent } from './course-info.component';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { HttpService } from '@/_services/http.service';

describe('PlayerResultsComponent', () => {
  let component: CourseInfoComponent;
  let fixture: ComponentFixture<CourseInfoComponent>;
  let componentRef: ComponentRef<CourseInfoComponent>;
  const tournamentNavigationService: TournamentNavigationService = new TournamentNavigationService();

   const standardSetup = () => {
      fixture = TestBed.createComponent(CourseInfoComponent);
      component = fixture.componentInstance;
      history.pushState({
        data: {
          course: {id: 1, name: 'Test Course', par: 72},
          parent: 'tournament',
        }
      }, '');

    component.navigationService.tournament.set({id: 1, name: 'test', startDate: '10/10/2020', endDate: '10/10/2020', bestRounds: 0, playHcpMultiplayer: 1, player: {id: 1}});
    component.navigationService.tournamentPlayers.set([{playerId: 1, nick: 'golfer', whs: 39.4}]);
    fixture.detectChanges();
    };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CourseInfoComponent],
      providers: [ 
          HttpService,
          { provide: Router, useClass: MyRouterStub },
          { provide: TournamentNavigationService, useValue: tournamentNavigationService},
          provideHttpClient(withInterceptorsFromDi()),
          { provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true },
      ]
    })
    .compileComponents();
  }));

  
  it('should create', () => {  
    standardSetup();
    expect(component).toBeTruthy();
  });

  it('should call onCancel', () => {  
    standardSetup();
    component.onCancel();
    expect(component).toBeTruthy();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });
});
