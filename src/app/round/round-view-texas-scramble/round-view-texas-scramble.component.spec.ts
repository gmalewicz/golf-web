import { getTestRound } from '@/_helpers/test.helper';
import { Format } from '@/_models/format';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';

import { RoundViewTexasScrambleComponent } from './round-view-texas-scramble.component';

describe('RoundViewTexasScrambleComponent', () => {

  let component: RoundViewTexasScrambleComponent;
  let fixture: ComponentFixture<RoundViewTexasScrambleComponent>;
  let componentRef: ComponentRef<RoundViewTexasScrambleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoundViewTexasScrambleComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    const round = getTestRound();
    round.format = Format.TEXAS_SCRAMBLE;

    fixture = TestBed.createComponent(RoundViewTexasScrambleComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('round', round);
    fixture.detectChanges();
  });

  it('should create and build two teams of two players', () => {
    expect(component).toBeTruthy();
    expect(component.displaySgn()).toBeTrue();
    expect(component.teams.map(t => t.players)).toEqual([[0, 1], [2, 3]]);
    expect(component.teams.map(t => t.allowances)).toEqual([[35, 15], [35, 15]]);
  });

  it('should calculate team handicap from the allowances', () => {
    // 10 * 133 / 113 + 68 - 72 = 7.77 for both players: 7.77 * 0.35 + 7.77 * 0.15 = 3.88 => 4
    expect(component.teams[0].hcp).toBe(4);
  });

  it('should show gross rows first, then net rows, labelled with the team players', () => {
    const gross: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('#texasGross'));
    const net: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('#texasNet'));
    expect(gross.map(el => el.textContent?.trim())).toEqual(['test/test2', 'test3/test2']);
    expect(net.map(el => el.textContent?.trim())).toEqual(['test/test2 (net)', 'test3/test2 (net)']);
    expect(gross[1].compareDocumentPosition(net[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('should mark the winning team on gross rows only when it has the lower net score', () => {
    const teams = component.resultSgn().teams;
    expect(teams).toHaveSize(2);
    component.holeWinnerSgn().forEach((holes, t) =>
      holes.forEach((cls, hole) => {
        const net = teams[t].holes[hole];
        const other = teams[1 - t].holes[hole];
        expect(cls === 'highlightMPResult').toBe(net !== undefined && other !== undefined && net < other);
      }));
  });

  it('should show the net result of the teams below the table', () => {
    const result: string = fixture.nativeElement.querySelector('h3').textContent.replace(/\s+/g, ' ').trim();
    const teams = component.resultSgn().teams;
    expect(result).toBe(`test/test2 ${teams[0].total} : test3/test2 ${teams[1].total}`);
    expect(fixture.nativeElement.querySelectorAll('h3 .golf-red')).toHaveSize(2);
  });

  it('should use the strokes of the first team player as the team strokes', () => {
    const scoreCard = component.round().scoreCard!;
    const teamStrokes = Array.from({ length: 18 }, (_, hole) => scoreCard[hole]?.stroke);
    expect(component.strokes[0]).toEqual(teamStrokes);
    expect(component.grossSums[0].front).toBe(teamStrokes.slice(0, 9).reduce((s, v) => (s ?? 0) + (v ?? 0), 0));
  });
});
