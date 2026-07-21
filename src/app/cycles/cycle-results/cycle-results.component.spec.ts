import { routing } from '@/app.routing';
import { AuthenticationService } from '@/_services/authentication.service';
import { HttpService } from '@/_services/http.service';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';


import { CycleResultsComponent } from './cycle-results.component';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { ComponentRef } from '@angular/core';

describe('CycleResultsComponent', () => {
  let component: CycleResultsComponent;
  let fixture: ComponentFixture<CycleResultsComponent>;
  let componentRef: ComponentRef<CycleResultsComponent>;
  let authenticationService: AuthenticationService;

  const mockCycleTournaments = [{
    id: 20,
    name: 'Sobienie Królewskie',
    rounds: 1,
    bestOf: false
  }];

  const mockCycleResults = [
    { playerName: 'Alice', name: 'Alice', total: 100, r: [35], cycleResult: 35, series: 1, oldPlace: 2 },
    { playerName: 'Bob',   name: 'Bob',   total: 90,  r: [30], cycleResult: 30, series: 1, oldPlace: 1 },
    { playerName: 'Carol', name: 'Carol', total: 80,  r: [25], cycleResult: 25, series: 1, oldPlace: 3 },
  ];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [
        CycleResultsComponent,
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
    fixture = TestBed.createComponent(CycleResultsComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef

    componentRef.setInput('cycle', {id: 1, name: 'Test', status: false});
    componentRef.setInput('cycleResults', []);
    componentRef.setInput('cycleTournaments', mockCycleTournaments);
    fixture.detectChanges();
  });

  it('should create but player does not exists', () => {
    authenticationService = TestBed.inject(AuthenticationService);
    authenticationService.logout();
    fixture = TestBed.createComponent(CycleResultsComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('cycle', {id: 1, name: 'Test', status: false});
    componentRef.setInput('cycleResults', []);
    componentRef.setInput('cycleTournaments', []);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display up arrow for player who improved position', () => {
    componentRef.setInput('cycleResults', mockCycleResults);
    fixture.detectChanges();
    const compiled: HTMLElement = fixture.nativeElement;
    const trendCells = compiled.querySelectorAll('td[id="trend"]');
    // Alice was at position 2, now at position 1 (idx=0+1) -> improved -> ▲ 1
    expect(trendCells[0].textContent?.trim()).toBe('▲ 1');
  });

  it('should display down arrow for player who lost position', () => {
    componentRef.setInput('cycleResults', mockCycleResults);
    fixture.detectChanges();
    const compiled: HTMLElement = fixture.nativeElement;
    const trendCells = compiled.querySelectorAll('td[id="trend"]');
    // Bob was at position 1, now at position 2 (idx=1+1) -> worsened -> ▼ 1
    expect(trendCells[1].textContent?.trim()).toBe('▼ 1');
  });

  it('should display circle for player whose position is unchanged', () => {
    componentRef.setInput('cycleResults', mockCycleResults);
    fixture.detectChanges();
    const compiled: HTMLElement = fixture.nativeElement;
    const trendCells = compiled.querySelectorAll('td[id="trend"]');
    // Carol was at position 3, now at position 3 (idx=2+1) -> unchanged -> ● span
    expect(trendCells[2].querySelector('span')).not.toBeNull();
    expect(trendCells[2].querySelector('span')?.textContent?.trim()).toBe('●');
  });

  it('should display circle and no delta when oldPlace is 0 (first tournament or after deletion)', () => {
    const firstTournamentResults = [
      { playerName: 'Alice', name: 'Alice', total: 100, r: [35], cycleResult: 35, series: 1, oldPlace: 0 },
      { playerName: 'Bob',   name: 'Bob',   total: 90,  r: [30], cycleResult: 30, series: 1, oldPlace: 0 },
    ];
    componentRef.setInput('cycleResults', firstTournamentResults);
    fixture.detectChanges();
    const compiled: HTMLElement = fixture.nativeElement;
    const trendCells = compiled.querySelectorAll('td[id="trend"]');
    // both players should show ● span only
    expect(trendCells[0].querySelector('span')).not.toBeNull();
    expect(trendCells[0].querySelector('span')?.textContent?.trim()).toBe('●');
    expect(trendCells[1].querySelector('span')).not.toBeNull();
    expect(trendCells[1].querySelector('span')?.textContent?.trim()).toBe('●');
  });

  it('should NOT display trend column for a closed cycle', () => {
    componentRef.setInput('cycle', {id: 1, name: 'Test', status: true});
    componentRef.setInput('cycleResults', mockCycleResults);
    fixture.detectChanges();
    const compiled: HTMLElement = fixture.nativeElement;
    expect(compiled.querySelector('th[id="htrend"]')).toBeNull();
    expect(compiled.querySelector('td[id="trend"]')).toBeNull();
  });

  it('should display trend column for an open cycle', () => {
    componentRef.setInput('cycleResults', mockCycleResults);
    fixture.detectChanges();
    const compiled: HTMLElement = fixture.nativeElement;
    expect(compiled.querySelector('th[id="htrend"]')).not.toBeNull();
    expect(compiled.querySelectorAll('td[id="trend"]')).toHaveSize(3);
  });

  afterEach(() => {
    localStorage.removeItem('currentPlayer');
  });
});
