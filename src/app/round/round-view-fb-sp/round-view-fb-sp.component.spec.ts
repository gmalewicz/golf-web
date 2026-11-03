import { getTestRound } from '@/_helpers/test.helper';
import { Format } from '@/_models/format';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';

import { RoundViewFbSpComponent } from './round-view-fb-sp.component';

describe('RoundViewFbSpComponent', () => {

  let component: RoundViewFbSpComponent;
  let fixture: ComponentFixture<RoundViewFbSpComponent>;
  let componentRef: ComponentRef<RoundViewFbSpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoundViewFbSpComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    const round = getTestRound();
    round.format = Format.FOUR_BALL_STROKE_PLAY;
    round.mpFormat = 0.85;

    fixture = TestBed.createComponent(RoundViewFbSpComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('round', round);
    fixture.detectChanges();
  });

  it('should create and calculate team results', () => {
    expect(component).toBeTruthy();
    expect(component.displaySgn()).toBeTrue();
    expect(component.resultSgn().teams.map(t => t.players)).toEqual([[0, 1], [2, 3]]);
    expect(component.resultSgn().teams[0].holes[1]).toBeDefined();
    expect(fixture.nativeElement.textContent).toContain('Team 1 (net)');
  });

  it('should mark winning team results', () => {
    const teams = component.resultSgn().teams;
    expect(teams).toHaveSize(2);
    component.holeWinnerSgn().forEach((holes, t) =>
      holes.forEach((cls, hole) => {
        const net = teams[t].holes[hole];
        const other = teams[1 - t].holes[hole];
        expect(cls === 'highlightMPResult').toBe(net !== undefined && other !== undefined && net < other);
      }));
  });

  it('should apply allowance to playing handicap', () => {
    // 10 * 133 / 113 + 68 - 72 = 7.77, 85% => 6.6 => 7
    expect(component.playingHcp[0]).toBe(7);
  });
});
