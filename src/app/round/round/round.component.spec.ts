import { RoundViewComponent } from './../round-view/round-view.component';
import { routing } from '@/app.routing';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { MatDialogMock, MyRouterStub, alertServiceStub, authenticationServiceStub, getTestRound } from '@/_helpers/test.helper';
import { AlertService, AuthenticationService } from '@/_services';
import { HttpService } from '@/_services/http.service';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RoundComponent } from './round.component';
import { RoundsNavigationService } from '@/rounds/roundsNavigation.service';
import { PreloadAllModules, Router, provideRouter, withPreloading } from '@angular/router';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';

describe('RoundComponent', () => {
  let component: RoundComponent;
  let fixture: ComponentFixture<RoundComponent>;

  beforeEach(async() => {
    TestBed.configureTestingModule({
    imports: [
        MatDialogModule,
        BaseChartDirective,
        RoundComponent,
        RoundViewComponent
    ],
    providers: [HttpService,
        { provide: AuthenticationService, useValue: authenticationServiceStub },
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true },
        { provide: MatDialog, useClass: MatDialogMock },
        { provide: Router, useClass: MyRouterStub },
        { provide: AlertService, useValue: alertServiceStub },
        RoundsNavigationService,
        provideCharts(withDefaultRegisterables()),
        provideHttpClient(withInterceptorsFromDi()),
        provideRouter(routing, withPreloading(PreloadAllModules))]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoundComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    history.pushState({data: {round: getTestRound()}}, '');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create but no data', () => {
    history.pushState({}, '');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should call onDelete', () => {
    history.pushState({data: {round: getTestRound()}}, '');
    fixture.detectChanges();
    component.onDelete();
    expect(component).toBeTruthy();
  });

  it('should call onEdit', () => {
    history.pushState({data: {round: getTestRound()}}, '');
    fixture.detectChanges();
    component.round.scoreCard.forEach(s => s.player = component.round.player[0]);
    component.onEdit();
    expect(component).toBeTruthy();
  });

  it('should call onCancel', () => {
    history.pushState({data: {round: getTestRound()}}, '');
    fixture.detectChanges();
    component.onCancel();
    expect(component).toBeTruthy();
  });

  it('should call onCancel with back set', () => {
    history.pushState({data: {round: getTestRound(), back: true}}, '');
    fixture.detectChanges();
    component.onCancel();
    expect(component).toBeTruthy();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
