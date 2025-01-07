import { CycleStatus } from './../_models/cycle';
import { CycleTournamentComponent } from './../cycle-tournament/cycle-tournament.component';
import { CycleResultsComponent } from './../cycle-results/cycle-results.component';
import { routing } from '@/app.routing';
import { alertServiceStub, authenticationServiceAdminStub, MyRouterStub } from '@/_helpers/test.helper';
import { AuthenticationService } from '@/_services/authentication.service';
import { HttpService } from '@/_services/http.service';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MimicBackendCycleInterceptor } from '../_helpers/MimicBackendCycleInterceptor';
import { CycleHttpService } from '../_services/cycleHttp.service';
import { CycleDetailsComponent } from './cycle-details.component';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { PreloadAllModules, provideRouter, Router, withPreloading } from '@angular/router';
import { AlertService } from '@/_services/alert.service';

describe('CycleDetailsComponent', () => {
  let component: CycleDetailsComponent;
  let fixture: ComponentFixture<CycleDetailsComponent>;

  class MatDialogMock {

    open() {
        return {
            afterClosed: () => of({

              name: 'test',
              rounds: 1,
              bestOd: false,
              tournamentNo: 60
            }),
            componentInstance: {confirmMessage: ''}
        };
    }
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatDialogModule,
        CycleDetailsComponent, CycleResultsComponent, CycleTournamentComponent
    ],
    providers: [HttpService,
        { provide: AuthenticationService, useValue: authenticationServiceAdminStub },
        CycleHttpService,
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendCycleInterceptor, multi: true },
        { provide: MatDialog, useClass: MatDialogMock },
        { provide: Router, useClass: MyRouterStub },
        { provide: AlertService, useValue: alertServiceStub },
        provideHttpClient(withInterceptorsFromDi()),
        provideRouter(routing, withPreloading(PreloadAllModules))
    ]
})
      .compileComponents();
  }));

  it('should create not initialized', () => {
    fixture = TestBed.createComponent(CycleDetailsComponent);
    component = fixture.componentInstance;
    history.pushState({
      data: undefined
    }, '');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should add tournament to cycle',  fakeAsync(() => {
    fixture = TestBed.createComponent(CycleDetailsComponent);
    history.pushState({
      data: {
        cycle: {
          id: 1, 
          name: 'Test tournament 1', 
          status: false, 
          version: 0,
          bestRounds: 0,
          player: { id: 1, nick: 'golfer', sex: false, whs: 38.4 }
        }
      }
    }, '');
    component = fixture.componentInstance;
    fixture.detectChanges();

    const buttonElement = fixture.debugElement.query(By.css('.add'));
    // Trigger click event after spyOn
    buttonElement.triggerEventHandler('click',  {});
    tick();

    expect(component).toBeTruthy();
  }));

  it('should delete cycle',  fakeAsync(() => {
    fixture = TestBed.createComponent(CycleDetailsComponent);
    history.pushState({
      data: {
        cycle: {
          id: 1, name: 'Test tournament 1', status: false, rule: 0,
          player: { id: 1, nick: 'golfer', sex: false, whs: 38.4 }
        }
      }
    }, '');
    component = fixture.componentInstance;
    fixture.detectChanges();

    const buttonElement = fixture.debugElement.query(By.css('.del2'));
    // Trigger click event after spyOn
    buttonElement.triggerEventHandler('click',  {});
   // tick();
    expect(component.loadingDeleteCycle).toBeTruthy();
  }));

  it('should close cycle',  fakeAsync(() => {
    fixture = TestBed.createComponent(CycleDetailsComponent);
    history.pushState({
      data: {
        cycle: {
          id: 1, name: 'Test cycle 1', status: false, rule: 0,
          player: { id: 1, nick: 'golfer', sex: false, whs: 38.4 }
        }
      }
    }, '');
    component = fixture.componentInstance;
    fixture.detectChanges();

    const buttonElement = fixture.debugElement.query(By.css('.cls'));
    // Trigger click event after spyOn
    buttonElement.triggerEventHandler('click',  {});
   // tick();
    expect(component.cycle.status).toBe(CycleStatus.STATUS_CLOSE);
  }));

  it('should delete last tournament',  fakeAsync(() => {
    fixture = TestBed.createComponent(CycleDetailsComponent);
    history.pushState({
      data: {
        cycle: {
          id: 1, name: 'Test cycle 1', status: false, rule: 0,
          player: { id: 1, nick: 'golfer', sex: false, whs: 38.4 }
        }
      }
    }, '');
    component = fixture.componentInstance;
    fixture.detectChanges();

    const buttonElement = fixture.debugElement.query(By.css('.lst'));
    // Trigger click event after spyOn
    buttonElement.triggerEventHandler('click',  {});
   // tick();
    expect(component.cycleTournaments.length).toEqual(1);
  }));

});
