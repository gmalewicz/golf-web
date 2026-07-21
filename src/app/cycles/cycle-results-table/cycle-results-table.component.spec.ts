import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { CycleResultsTableComponent } from './cycle-results-table.component';

describe('CycleResultsTableComponent', () => {
  let component: CycleResultsTableComponent;
  let fixture: ComponentFixture<CycleResultsTableComponent>;
  let componentRef: ComponentRef<CycleResultsTableComponent>;

  const mockCycleTournaments = [
    { id: 20, name: 'Sobienie Królewskie', rounds: 1, bestOf: false },
    { id: 21, name: 'Rajszew',             rounds: 1, bestOf: false },
  ];

  // rounds: [0, 4] — 2 tournaments, offset step of 4
  const mockRounds = [0, 4];
  const mockNames  = [0, 1];

  const mockResults = [
    { playerName: 'Alice', name: 'Alice', total: 37, r: [20, 0, 0, 0, 17, 0, 0, 0], cycleResult: 20, series: 1, oldPlace: 2 },
    { playerName: 'Bob',   name: 'Bob',   total: 34, r: [17, 0, 0, 0, 17, 0, 0, 0], cycleResult: 17, series: 1, oldPlace: 1 },
    { playerName: 'Carol', name: 'Carol', total: 28, r: [14, 0, 0, 0, 14, 0, 0, 0], cycleResult: 14, series: 1, oldPlace: 3 },
  ];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CycleResultsTableComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CycleResultsTableComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('cycle', { id: 1, name: 'Grand Prix 2025', status: false });
    componentRef.setInput('results', []);
    componentRef.setInput('cycleTournaments', mockCycleTournaments);
    componentRef.setInput('rounds', mockRounds);
    componentRef.setInput('names', mockNames);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a row per result', () => {
    componentRef.setInput('results', mockResults);
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows).toHaveSize(3);
  });

  it('should display sequential row numbers', () => {
    componentRef.setInput('results', mockResults);
    fixture.detectChanges();
    const noCells = fixture.nativeElement.querySelectorAll('td[id="no"]');
    expect(noCells[0].textContent.trim()).toBe('1');
    expect(noCells[1].textContent.trim()).toBe('2');
    expect(noCells[2].textContent.trim()).toBe('3');
  });

  it('should display player names', () => {
    componentRef.setInput('results', mockResults);
    fixture.detectChanges();
    const nameCells = fixture.nativeElement.querySelectorAll('td[id="name"]');
    expect(nameCells[0].textContent.trim()).toBe('Alice');
    expect(nameCells[1].textContent.trim()).toBe('Bob');
  });

  it('should render one r-column per round using offset-based index', () => {
    componentRef.setInput('results', mockResults);
    fixture.detectChanges();
    const compiled: HTMLElement = fixture.nativeElement;
    const rCells = compiled.querySelectorAll('tbody tr:first-child td[id="r"]');
    // Alice: r[0]=20 (tournament 1), r[4]=17 (tournament 2)
    expect(rCells).toHaveSize(2);
    expect(rCells[0].textContent.trim()).toBe('20');
    expect(rCells[1].textContent.trim()).toBe('17');
  });

  it('should render tournament column headers from cycleTournaments', () => {
    componentRef.setInput('results', mockResults);
    fixture.detectChanges();
    const headers = fixture.nativeElement.querySelectorAll('th[id="hr23"]');
    expect(headers).toHaveSize(2);
    expect(headers[0].textContent).toContain('Sobienie Królewskie');
    expect(headers[1].textContent).toContain('Rajszew');
  });

  it('should display cycleResult and total columns', () => {
    componentRef.setInput('results', mockResults);
    fixture.detectChanges();
    const resultCells = fixture.nativeElement.querySelectorAll('th[id="result"]');
    const totalCells  = fixture.nativeElement.querySelectorAll('th[id="total"]');
    expect(resultCells[0].textContent.trim()).toBe('20');
    expect(totalCells[0].textContent.trim()).toBe('37');
  });

  it('should show trend column header for an open cycle', () => {
    componentRef.setInput('results', mockResults);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('th[id="htrend"]')).not.toBeNull();
  });

  it('should hide trend column header for a closed cycle', () => {
    componentRef.setInput('cycle', { id: 1, name: 'Grand Prix 2025', status: true });
    componentRef.setInput('results', mockResults);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('th[id="htrend"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('td[id="trend"]')).toBeNull();
  });

  it('should display up arrow for a player who improved position', () => {
    componentRef.setInput('results', mockResults);
    fixture.detectChanges();
    const trendCells = fixture.nativeElement.querySelectorAll('td[id="trend"]');
    // Alice: oldPlace=2, now idx=0 (position 1) → improved by 1 → ▲ 1
    expect(trendCells[0].textContent.trim()).toBe('▲ 1');
  });

  it('should display down arrow for a player who lost position', () => {
    componentRef.setInput('results', mockResults);
    fixture.detectChanges();
    const trendCells = fixture.nativeElement.querySelectorAll('td[id="trend"]');
    // Bob: oldPlace=1, now idx=1 (position 2) → worsened by 1 → ▼ 1
    expect(trendCells[1].textContent.trim()).toBe('▼ 1');
  });

  it('should display circle ● for a player whose position is unchanged', () => {
    componentRef.setInput('results', mockResults);
    fixture.detectChanges();
    const trendCells = fixture.nativeElement.querySelectorAll('td[id="trend"]');
    // Carol: oldPlace=3, now idx=2 (position 3) → unchanged → ●
    const span = trendCells[2].querySelector('span');
    expect(span).not.toBeNull();
    expect(span.textContent.trim()).toBe('●');
  });

  it('should display circle ● when oldPlace is 0 (no previous tournament)', () => {
    const firstTournamentResults = [
      { playerName: 'Alice', name: 'Alice', total: 20, r: [20, 0, 0, 0], cycleResult: 20, series: 1, oldPlace: 0 },
    ];
    componentRef.setInput('results', firstTournamentResults);
    componentRef.setInput('rounds', [0]);
    componentRef.setInput('names', [0]);
    componentRef.setInput('cycleTournaments', [mockCycleTournaments[0]]);
    fixture.detectChanges();
    const trendCell = fixture.nativeElement.querySelector('td[id="trend"]');
    expect(trendCell.querySelector('span').textContent.trim()).toBe('●');
  });

  it('should render no rows when results is empty', () => {
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows).toHaveSize(0);
  });

  it('should render no r-columns when rounds is empty', () => {
    componentRef.setInput('results', mockResults);
    componentRef.setInput('rounds', []);
    componentRef.setInput('names', []);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('td[id="r"]')).toBeNull();
  });
});
