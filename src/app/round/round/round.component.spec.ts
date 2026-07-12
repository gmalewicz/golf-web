import { RoundViewComponent } from './../round-view/round-view.component';
import { routing } from '@/app.routing';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { MatDialogMock, MyRouterStub, alertServiceStub, authenticationServiceStub, getTestRound } from '@/_helpers/test.helper';
import { AlertService, AuthenticationService } from '@/_services';
import { HttpService } from '@/_services/http.service';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
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
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
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

  it('should set display to true and selectedTab to 0 after init', () => {
    history.pushState({data: {round: getTestRound()}}, '');
    fixture.detectChanges();
    expect(component.display).toBeTrue();
    expect(component.selectedTab).toBe(0);
  });

  it('should set viewOnly to false when current player is in round', () => {
    history.pushState({data: {round: getTestRound()}}, '');
    fixture.detectChanges();
    expect(component.viewOnly).toBeFalse();
  });

  it('should keep viewOnly true when tournamentRound flag is set', () => {
    history.pushState({data: {round: getTestRound(), tournamentRound: true}}, '');
    fixture.detectChanges();
    expect(component.viewOnly).toBeTrue();
  });

  it('should call onTabClick and update selectedTab', () => {
    history.pushState({data: {round: getTestRound()}}, '');
    fixture.detectChanges();
    component.onTabClick(2);
    expect(component.selectedTab).toBe(2);
  });

  it('should onEdit navigate to addScorecard with correct course URL', () => {
    history.pushState({data: {round: getTestRound()}}, '');
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    component.round.scoreCard!.forEach(s => s.player = component.round.player![0]);
    component.onEdit();
    const navigateArgs = (router.navigate as jasmine.Spy).calls.mostRecent().args;
    expect(navigateArgs[0][0]).toBe('/addScorecard/1/Lisia Polana/72');
  });

  it('should onCancel navigate to home when no back flag', () => {
    history.pushState({data: {round: getTestRound()}}, '');
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    component.onCancel();
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should onCancel with back call restoreLast and navigate to rounds', () => {
    history.pushState({data: {round: getTestRound(), back: true}}, '');
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    const rnService = TestBed.inject(RoundsNavigationService);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    spyOn(rnService, 'restoreLast');
    component.onCancel();
    expect(rnService.restoreLast).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/rounds']);
  });

  it('should onDelete navigate to home after successful deletion', () => {
    history.pushState({data: {round: getTestRound()}}, '');
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    component.onDelete();
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
