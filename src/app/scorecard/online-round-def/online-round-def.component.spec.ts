import { NavigationService } from './../_services/navigation.service';
import { ConfirmationDialogComponent } from '@/confirmation-dialog/confirmation-dialog.component';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { authenticationServiceStub, getTee, getTestCourse} from '@/_helpers/test.helper';
import { AlertService, AuthenticationService, HttpService } from '@/_services';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DropdownModule } from 'primeng/dropdown';
import { of } from 'rxjs';
import { MimicBackendScoreInterceptor } from '../_helpers/MimicBackendScoreInterceptor';
import { ScorecardHttpService } from '../_services/scorecardHttp.service';

import { OnlineRoundDefComponent } from './online-round-def.component';

describe('OnlineRoundDefComponent', () => {
  let component: OnlineRoundDefComponent;
  let fixture: ComponentFixture<OnlineRoundDefComponent>;

  const routerStub: Partial<Router> = {
    // tslint:disable-next-line: variable-name
    navigate(_commands: any[]): Promise<boolean> {
      return null;
    }
  };

  const alertServiceStub: Partial<AlertService> = {
    clear() {
      // This is intentional
    },
    // tslint:disable-next-line: variable-name
    error(_message: string, _keepAfterRouteChange = false) {
      // This is intentional
    }
  };

  class MatDialogMock {

    open() {
        return {
            afterClosed: () => of(),
            componentInstance: {confirmMessage: ''}
        };
    }
  }

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
        { provide: Router, useValue: routerStub },
        { provide: AlertService, useValue: alertServiceStub },
        { provide: ConfirmationDialogComponent, useClass: MatDialogMock},
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

    component.f.nick2.enable();
    component.f.nick2.setValue('test');
    component.onSearchPlayer(1);
    expect(component.f.nick2.enabled).toBeTruthy();
  }));

  it('should search the second player with different nick but not found', fakeAsync(() => {

    component.f.nick2.enable();
    component.f.nick2.setValue('Other');
    component.onSearchPlayer(1);
    expect(component.f.nick2.enabled).toBeTruthy();
  }));

  it('should search the second player with different nick and player found', fakeAsync(() => {

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

    component.f.matchPlay.setValue(true);
    component.f.teeDropDown1.setValue(1);
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

    component.f.nick4.enable();
    component.f.nick4.setValue('Other2');
    component.onSearchPlayer(3);
    expect(component.f.nick2.enabled).toBeFalsy();
  }));

  it('should update WHS for the second player', fakeAsync(() => {

    component.f.nick2.enable();
    component.f.nick2.setValue('Other');
    component.updateWHS(1);
    expect(component.f.nick2.enabled).toBeTruthy();
  }));

  it('should tee change for the first player', fakeAsync(() => {

    component.f.teeDropDown1.setValue(1);
    component.course.tees.push(getTee());
    component.teeChange(0);
    expect(component.tees[0].id).toBe(1);
  }));


  afterAll(() => {
    TestBed.resetTestingModule();
  });

});

