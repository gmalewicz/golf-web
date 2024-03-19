import { routing } from '@/app.routing';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { authenticationServiceStub, MatDialogMock } from '@/_helpers/test.helper';
import { AuthenticationService } from '@/_services/authentication.service';
import { HttpService } from '@/_services/http.service';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
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
        provideHttpClient(withInterceptorsFromDi()),
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
    expect(component.playerRound.length).toEqual(0);
  }));

  it('should click update', fakeAsync(() => {
    component = fixture.componentInstance;
    component.playerRound = [{id: 1, nick: 'test', sex: false, whs: 1.0, role: 1, roundCnt: 1, type: 0}];
    component.onClickUpdate(0);
    expect(component.playerRound[0].nick).toEqual('Player');
  }));
});
