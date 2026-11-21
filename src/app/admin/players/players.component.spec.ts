import { routing } from '@/app.routing';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { authenticationServiceStub, MatDialogMock } from '@/_helpers/test.helper';
import { AuthenticationService } from '@/_services/authentication.service';
import { HttpService } from '@/_services/http.service';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule} from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { PlayersComponent } from './players.component';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';

describe('PlayersComponent', () => {
  let component: PlayersComponent;
  let fixture: ComponentFixture<PlayersComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatDialogModule,
        PlayersComponent
    ],
    providers: [HttpService,
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true },
        { provide: AuthenticationService, useValue: authenticationServiceStub },
        { provide: MatDialog, useClass: MatDialogMock },
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideRouter(routing, withPreloading(PreloadAllModules))
    ]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayersComponent);
  });

  it('should create', () => {
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create with defined playerRoundCnt', () => {
    component = fixture.componentInstance;
    component.playerRound = [];
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should click delete', fakeAsync(() => {
    component = fixture.componentInstance;
    component.playerRound = [{id: 1, nick: 'test', sex: false, whs: 1.0, role: 1, roundCnt: 1, type: 0}];
    component.onClickDelete(1);
    expect(component.playerRound).toHaveSize(0);
  }));

  it('should click update', fakeAsync(() => {
    component = fixture.componentInstance;
    component.playerRound = [{id: 1, nick: 'test', sex: false, whs: 1.0, role: 1, roundCnt: 1, type: 0}];
    component.onClickUpdate(0);
    expect(component.playerRound[0].nick).toEqual('Player');
  }));

  it('should update PZG ID', fakeAsync(() => {
    component = fixture.componentInstance;
    component.playerRound = [{id: 1, nick: 'test', sex: false, whs: 1.0, role: 1, roundCnt: 1, type: 0, pzgId: null}];
    (TestBed.inject(MatDialog) as unknown as MatDialogMock).setRetVal({pzgId: 123});
    component.onClickPzgId(0);
    expect(component.playerRound[0].pzgId).toEqual(123);
  }));

  it('should clear PZG ID', fakeAsync(() => {
    component = fixture.componentInstance;
    component.playerRound = [{id: 1, nick: 'test', sex: false, whs: 1.0, role: 1, roundCnt: 1, type: 0, pzgId: 123}];
    (TestBed.inject(MatDialog) as unknown as MatDialogMock).setRetVal({pzgId: null});
    component.onClickPzgId(0);
    expect(component.playerRound[0].pzgId).toBeNull();
  }));

  it('should not change PZG ID when dialog cancelled', fakeAsync(() => {
    component = fixture.componentInstance;
    component.playerRound = [{id: 1, nick: 'test', sex: false, whs: 1.0, role: 1, roundCnt: 1, type: 0, pzgId: 123}];
    (TestBed.inject(MatDialog) as unknown as MatDialogMock).setRetVal(undefined);
    component.onClickPzgId(0);
    expect(component.playerRound[0].pzgId).toEqual(123);
  }));

  it('should update WHS from PZG', fakeAsync(() => {
    component = fixture.componentInstance;
    component.playerRound = [{id: 1, nick: 'test', sex: false, whs: 1.0, role: 1, roundCnt: 1, type: 0, pzgId: 123}];
    component.onClickPzgHcp(0, new Event('click'));
    expect(component.playerRound[0].whs).toEqual(5.5);
    expect(component.pzgUpdating.size).toEqual(0);
  }));

  it('should show PZG update button only for player with PZG ID and not open dialog', () => {
    component = fixture.componentInstance;
    component.playerRound = [{id: 1, nick: 'test', sex: false, whs: 1.0, role: 1, roundCnt: 1, type: 0},
                             {id: 2, nick: 'test2', sex: false, whs: 1.0, role: 1, roundCnt: 1, type: 0, pzgId: 77}];
    fixture.detectChanges();
    const cells = fixture.nativeElement.querySelectorAll('tbody tr td:nth-child(8)');
    expect(cells[0].querySelector('button')).toBeNull();
    const button = cells[1].querySelector('button');
    expect(button).not.toBeNull();
    spyOn(component, 'onClickPzgId');
    button.click();
    expect(component.onClickPzgId).not.toHaveBeenCalled();
  });

  it('should display n/a when PZG ID is not set', () => {
    component = fixture.componentInstance;
    component.playerRound = [{id: 1, nick: 'test', sex: false, whs: 1.0, role: 1, roundCnt: 1, type: 0},
                             {id: 2, nick: 'test2', sex: false, whs: 1.0, role: 1, roundCnt: 1, type: 0, pzgId: 77}];
    fixture.detectChanges();
    const cells = fixture.nativeElement.querySelectorAll('tbody tr td:nth-child(8)');
    expect(cells[0].textContent.trim()).toEqual('n/a');
    expect(cells[1].textContent.trim()).toEqual('77');
  });
});
