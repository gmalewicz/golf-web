import { NavigationService } from './../_services/navigation.service';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { alertServiceStub, authenticationServiceStub, getTee, getTestCourse, getTestOnlineRound, MatDialogMock, MyRouterStub} from '@/_helpers/test.helper';
import { AlertService, AuthenticationService, HttpService } from '@/_services';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DropdownModule } from 'primeng/dropdown';
import { MimicBackendScoreInterceptor } from '../_helpers/MimicBackendScoreInterceptor';
import { ScorecardHttpService } from '../_services/scorecardHttp.service';
import { OnlineRoundDefComponent } from './online-round-def.component';
import { getOnlineRoundFirstPlayer } from '../_helpers/test.helper';

describe('OnlineRoundDefComponent', () => {
  let component: OnlineRoundDefComponent;
  let fixture: ComponentFixture<OnlineRoundDefComponent>;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [ OnlineRoundDefComponent ],
      imports: [
        HttpClientModule,
        FontAwesomeModule,
        DropdownModule,
        ReactiveFormsModule,
        MatDialogModule,
        BrowserAnimationsModule,
      ]
      ,
      providers: [HttpService,
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendScoreInterceptor, multi: true },
        { provide: AuthenticationService, useValue: authenticationServiceStub },
        { provide: Router, useClass: MyRouterStub },
        { provide: AlertService, useValue: alertServiceStub },
        { provide: MatDialog, useClass: MatDialogMock},
        ScorecardHttpService,
        NavigationService
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlineRoundDefComponent);
    history.pushState({data: {course: getTestCourse()}}, '');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should search the second player with duplicated nick', fakeAsync(() => {

    component.players = [getTestOnlineRound()[0].player];
    component.players[0].nick = 'Other';

    component.f.nick2.enable();
    component.f.nick2.setValue('Other');
    component.onSearchPlayer(1);
    expect(component.searchInProgress[1]).toBeFalsy();
  }));

  it('should search the second player with different nick but not found', () => {

    component.players = [getTestOnlineRound()[0].player, getTestOnlineRound()[1].player];

    component.f.nick2.enable();
    component.f.nick2.setValue('Other');
    component.onSearchPlayer(1);
    expect(component.f.nick2.disabled).toBeTruthy();
  });

  it('should search the second player with different nick and player found', fakeAsync(() => {

    component.players = [getTestOnlineRound()[0].player, getTestOnlineRound()[1].player];


    component.f.nick2.enable();
    component.f.nick2.setValue('Other2');
    component.onSearchPlayer(1);
    expect(component.f.nick2.enabled).toBeFalsy();
  }));

  it('start on-line stroke play round', fakeAsync(() => {

    component.f.teeDropDown1.setValue(1);
    component.onStartOnlineRound();
    expect(component).toBeTruthy();
  }));

  it('should select 2 players', fakeAsync(() => {
    component.onPlayers(2);
    expect(component.f.teeDropDown2.enabled).toBeTruthy();
  }));

  it('should select 3 players', fakeAsync(() => {
    component.onPlayers(3);
    expect(component.f.teeDropDown3.enabled).toBeTruthy();
  }));

  it('should select 4 players', fakeAsync(() => {
    component.onPlayers(4);
    expect(component.f.teeDropDown4.enabled).toBeTruthy();
  }));

  it('start on-line MP round', fakeAsync(() => {

    component.players = [getTestOnlineRound()[0].player, getTestOnlineRound()[1].player];
    component.tees = [getOnlineRoundFirstPlayer().tee, getOnlineRoundFirstPlayer().tee];

    component.f.matchPlay.setValue(true);
    component.f.teeDropDown1.setValue(1);
    component.f.teeDropDown2.setValue(1);
    component.onStartOnlineRound();
    expect(component).toBeTruthy();
  }));

  it('should search the third player with different nick and player found', fakeAsync(() => {

    component.f.nick3.enable();
    component.f.nick3.setValue('Other2');
    component.onSearchPlayer(2);
    expect(component.f.nick2.enabled).toBeFalsy();
  }));

  it('should search the fourth player with different nick and player found', fakeAsync(() => {

    component.players = [getTestOnlineRound()[0].player, getTestOnlineRound()[1].player];

    component.f.nick4.enable();
    component.f.nick4.setValue('Other2');
    component.onSearchPlayer(3);
    expect(component.f.nick2.enabled).toBeFalsy();
  }));

  it('should update WHS for the second player', () => {

    component.players = [getTestOnlineRound()[0].player, getTestOnlineRound()[1].player];

    component.f.nick2.enable();
    component.f.nick2.setValue('Other');
    component.updateWHS(1);
    expect(component.searchInProgress[1]).toBeFalsy();
  });

  it('should update WHS for the first player', () => {

    component.players = [getTestOnlineRound()[0].player, getTestOnlineRound()[1].player];

    component.f.nick1.setValue('Other');
    component.updateWHS(0);
    expect(component.searchInProgress[1]).toBeFalsy();
  });


  it('should tee change for the first player', fakeAsync(() => {

    component.f.teeDropDown1.setValue(1);
    component.course.tees.push(getTee());
    component.teeChange(0);
    expect(component.tees[0].id).toBe(1);
  }));

  it('should tee change for the second player', fakeAsync(() => {

    component.f.teeDropDown2.setValue(1);
    component.course.tees.push(getTee());
    component.course.tees.push(getTee());
    component.teeChange(1);
    expect(component.tees[1].id).toBe(1);
  }));

  it('should tee change for the third player', fakeAsync(() => {

    component.f.teeDropDown3.setValue(1);
    component.course.tees.push(getTee());
    component.course.tees.push(getTee());
    component.course.tees.push(getTee());
    component.teeChange(2);
    expect(component.tees[2].id).toBe(1);
  }));

  it('should tee change for the fourth player', fakeAsync(() => {

    component.f.teeDropDown4.setValue(1);
    component.course.tees.push(getTee());
    component.course.tees.push(getTee());
    component.course.tees.push(getTee());
    component.course.tees.push(getTee());
    component.teeChange(3);
    expect(component.tees[3].id).toBe(1);
  }));

  afterAll(() => {
    TestBed.resetTestingModule();
  });

});

