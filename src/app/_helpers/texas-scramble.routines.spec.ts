import { Course } from '@/_models/course';
import { Hole } from '@/_models/hole';
import {
  buildTexasTeams,
  calculateTexasGrossSums,
  calculateTexasHoleHcp,
  calculateTexasPlayerHcp,
  calculateTexasResult
} from './texas-scramble.routines';

describe('texas-scramble.routines', () => {

  const holes = Array.from({ length: 18 }, (_, i) => ({ number: i + 1, par: 4, si: i + 1 }) as unknown as Hole);
  const course = { id: 1, par: 72, holes } as unknown as Course;

  it('should apply 30%, 20% and 10% from the lowest to the highest handicap for a team of three', () => {
    const teams = buildTexasTeams([
      { team: 1, teeType: 0, hcp: 20 },
      { team: 1, teeType: 0, hcp: 10 },
      { team: 1, teeType: 0, hcp: 30 },
    ]);

    expect(teams).toHaveSize(1);
    expect(teams[0].players).toEqual([0, 1, 2]);
    expect(teams[0].allowances).toEqual([20, 30, 10]);
    // 20 * 0.2 + 10 * 0.3 + 30 * 0.1 = 10
    expect(teams[0].hcp).toBe(10);
  });

  it('should apply 35% and 15% within each team of two', () => {
    const teams = buildTexasTeams([
      { team: 1, teeType: 0, hcp: 12 },
      { team: 1, teeType: 0, hcp: 20 },
      { team: 2, teeType: 0, hcp: 30 },
      { team: 2, teeType: 0, hcp: 8 },
    ]);

    expect(teams.map(t => t.team)).toEqual([1, 2]);
    expect(teams[0].allowances).toEqual([35, 15]);
    expect(teams[1].allowances).toEqual([15, 35]);
    // 12 * 0.35 + 20 * 0.15 = 7.2
    expect(teams[0].hcp).toBe(7);
    // 30 * 0.15 + 8 * 0.35 = 7.3
    expect(teams[1].hcp).toBe(7);
    expect(teams[1].scorer).toBe(2);
  });

  it('should order players with the same handicap by their position', () => {
    const [team] = buildTexasTeams([
      { team: 1, teeType: 0, hcp: 10 },
      { team: 1, teeType: 0, hcp: 10 },
    ]);

    expect(team.allowances).toEqual([35, 15]);
    expect(team.hcp).toBe(5);
  });

  it('should calculate unrounded player handicap for the played holes', () => {
    expect(calculateTexasPlayerHcp(0, 10, 113, 72, holes, 72)).toBe(10);
    expect(calculateTexasPlayerHcp(1, 10, 113, 36, holes, 72)).toBe(5);
  });

  it('should distribute team handicap strokes by stroke index', () => {
    const teams = buildTexasTeams([
      { team: 1, teeType: 0, hcp: 20 },
      { team: 1, teeType: 0, hcp: 20 },
    ]);

    // 20 * 0.35 + 20 * 0.15 = 10
    const holeHcp = calculateTexasHoleHcp(teams, course);

    expect(holeHcp[0].reduce((p, n) => p + n, 0)).toBe(10);
    expect(holeHcp[0][0]).toBe(1);
    expect(holeHcp[0][10]).toBe(0);
  });

  it('should calculate net result and gross sums from the scorer strokes', () => {
    const teams = buildTexasTeams([
      { team: 1, teeType: 0, hcp: 10 },
      { team: 1, teeType: 0, hcp: 10 },
      { team: 2, teeType: 0, hcp: 10 },
      { team: 2, teeType: 0, hcp: 10 },
    ]);
    const strokes = [
      [4, 5, 16, ...new Array(15).fill(0)],
      [4, 5, 16, ...new Array(15).fill(0)],
      [3, 4, ...new Array(16).fill(0)],
      [3, 4, ...new Array(16).fill(0)],
    ];
    const holeHcp = teams.map(() => new Array(18).fill(0));
    holeHcp[0][1] = 1;

    const result = calculateTexasResult(teams, strokes, holeHcp);

    expect(result.teams).toHaveSize(2);
    expect(result.teams[0].holes.slice(0, 3)).toEqual([4, 4, undefined]);
    expect(result.teams[0].total).toBe(8);
    expect(result.teams[1].holes.slice(0, 3)).toEqual([3, 4, undefined]);
    expect(calculateTexasGrossSums(teams, strokes)[0].front).toBeNull();
    expect(calculateTexasGrossSums(teams, strokes)[1].front).toBe(7);
  });
});
