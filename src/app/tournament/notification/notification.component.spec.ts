import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationComponent } from './notification.component';
import { TournamentHttpService } from '../_services/tournamentHttp.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AlertService, AuthenticationService, HttpService } from '@/_services';
import { MatDialogMock, MyRouterStub, alertServiceStub, authenticationServiceStub } from '@/_helpers/test.helper';
import { MimicBackendTournamentInterceptor } from '../_helpers/MimicBackendTournamentInterceptor';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

describe('NotificationComponent', () => {
  let component: NotificationComponent;
  let fixture: ComponentFixture<NotificationComponent>;
  const dialog = new MatDialogMock();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationComponent, HttpClientModule],
      providers: [
        TournamentHttpService,
        HttpService,
        { provide: AuthenticationService, useValue: authenticationServiceStub },
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendTournamentInterceptor, multi: true },
        { provide: MatDialog, useValue: dialog},
        { provide: Router, useClass: MyRouterStub },
        { provide: AlertService, useValue: alertServiceStub },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationComponent);
    component = fixture.componentInstance;
    component.navigationService.tournament.set({id: 1, name: 'test', startDate: '10/10/2020', endDate: '10/10/2020', bestRounds: 0, player: {id: 1}});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create execute onSubscribe', () => {
    component.onSubscribe();
    expect(component).toBeTruthy();
  });

  it('should create execute onUnsubscribe', () => {
    component.onUnsubscribe();
    expect(component).toBeTruthy();
  });

  it('should create execute sendNotifications', () => {
    component.sendNotification();
    expect(component).toBeTruthy();
  });

});
