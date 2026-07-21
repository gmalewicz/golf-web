import { routing } from '@/app.routing';
import { AuthenticationService } from '@/_services/authentication.service';
import { HttpService } from '@/_services/http.service';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';


import { CycleResultsStrokePlayComponent } from './cycle-results-stroke-play.component';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { ComponentRef } from '@angular/core';

describe('CycleResultsStrokePlayComponent', () => {
  let component: CycleResultsStrokePlayComponent;
  let fixture: ComponentFixture<CycleResultsStrokePlayComponent>;
  let componentRef: ComponentRef<CycleResultsStrokePlayComponent>;
  let authenticationService: AuthenticationService;

  const mockCycleTournaments = [{
    id: 20,
    name: 'Sobienie Królewskie',
    rounds: 1,
    bestOf: false
  }];

  const mockCycleResults = [
    { playerName: 'Alice', name: 'Alice', total: 100, r: [35], cycleResult: 35, series: 2, oldPlace: 2 },
    { playerName: 'Bob',   name: 'Bob',   total: 90,  r: [30], cycleResult: 40, series: 2, oldPlace: 1 },
    { playerName: 'Carol', name: 'Carol', total: 80,  r: [25], cycleResult: 45, series: 2, oldPlace: 3 },
  ];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [
        CycleResultsStrokePlayComponent,
    ],
    providers: [HttpService,
                AuthenticationService,
                provideHttpClient(withXhr(), withInterceptorsFromDi()),
                provideRouter(routing, withPreloading(PreloadAllModules))]
})
      .compileComponents();
  }));

  beforeEach(() => {
    localStorage.setItem('currentPlayer', JSON.stringify([{nick: 'test', id: 1, password: 'test', whs: '10.2'}]));
    fixture = TestBed.createComponent(CycleResultsStrokePlayComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('cycle', {id: 1, name: 'Test', status: false, bestRounds: 1, maxWhs: 36, version: 1, series: 2});
    componentRef.setInput('cycleResults', []);
    componentRef.setInput('cycleTournaments', mockCycleTournaments);
    fixture.detectChanges();
  });

  it('should create but player does not exists', () => {
    authenticationService = TestBed.inject(AuthenticationService);
    authenticationService.logout();
    fixture = TestBed.createComponent(CycleResultsStrokePlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display trend column for an open cycle', () => {
    componentRef.setInput('cycleResults', mockCycleResults);
    fixture.detectChanges();
    const compiled: HTMLElement = fixture.nativeElement;
    expect(compiled.querySelector('th[id="htrend"]')).not.toBeNull();
    expect(compiled.querySelectorAll('td[id="trend"]').length).toBeGreaterThan(0);
  });

  it('should NOT display trend column for a closed cycle', () => {
    componentRef.setInput('cycle', {id: 1, name: 'Test', status: true, bestRounds: 1, maxWhs: 36, version: 1, series: 2});
    componentRef.setInput('cycleResults', mockCycleResults);
    fixture.detectChanges();
    const compiled: HTMLElement = fixture.nativeElement;
    expect(compiled.querySelector('th[id="htrend"]')).toBeNull();
    expect(compiled.querySelector('td[id="trend"]')).toBeNull();
  });

  afterEach(() => {
    localStorage.removeItem('currentPlayer');
  });
});
