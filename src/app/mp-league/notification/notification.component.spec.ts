import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationComponent } from './notification.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AlertService, AuthenticationService, HttpService } from '@/_services';
import { MatDialogMock, MyRouterStub, alertServiceStub, authenticationServiceStub } from '@/_helpers/test.helper';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MimicBackendMpLeaguesInterceptor } from '../_helpers/MimicBackendMpLeaguesInterceptor';
import { LeagueHttpService } from '../_services/leagueHttp.service';

describe('NotificationComponent', () => {
  let component: NotificationComponent;
  let fixture: ComponentFixture<NotificationComponent>;
  const dialog = new MatDialogMock();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationComponent, HttpClientModule],
      providers: [
        LeagueHttpService,
        HttpService,
        { provide: AuthenticationService, useValue: authenticationServiceStub },
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendMpLeaguesInterceptor, multi: true },
        { provide: MatDialog, useValue: dialog},
        { provide: Router, useClass: MyRouterStub },
        { provide: AlertService, useValue: alertServiceStub },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create execute onSubscribe', () => {
    component.navigationService.league.set({id: 1, name: 'test league', status: true, player: {id: 1}});
    component.onSubscribe();
    expect(component).toBeTruthy();
  });

  it('should create execute onUnsubscribe', () => {
    component.navigationService.league.set({id: 1, name: 'test league', status: true, player: {id: 1}});
    component.onUnsubscribe();
    expect(component).toBeTruthy();
  });

});
