import { Course } from '@/_models/course';
import { Hole } from '@/_models/hole';
import { calculateFbspPlayerSum, calculateFbspTeamResults, FbspPlayerSum, FbspResult } from './fbsp.routines';
import { calculateHoleHCP, calculateUnroundedCourseHCP, getPlayedCoursePar } from './whs.routines';

const HOLES = 18;

// percentages of the player handicap applied from the lowest to the highest handicap in the team, by the team size
export const TEXAS_SCRAMBLE_ALLOWANCES: Record<number, number[]> = {
  2: [35, 15],
  3: [30, 20, 10]
};

export interface TexasPlayer {
  team: number;
  teeType: number;
  // unrounded course handicap of the player
  hcp: number;
}

export interface TexasTeam {
  team: number;
  // indexes of the team players in the array passed to buildTexasTeams
  players: number[];
  // team members enter the single team result, the scorer is the first one
  scorer: number;
  teeType: number;
  // team playing handicap
  hcp: number;
  // percentage applied to the handicap of each team player [same order as players]
  allowances: number[];
}

/**
 * Unrounded course handicap of a player used to build the team handicap.
 */
export function calculateTexasPlayerHcp(teeType: number,
                                        whs: number,
                                        sr: number,
                                        cr: number,
                                        holes: Hole[],
                                        coursePar: number): number {

  return calculateUnroundedCourseHCP(teeType, whs, sr, cr, getPlayedCoursePar(holes, teeType, coursePar));
}

/**
 * Groups players into teams and calculates the team handicap. The percentages are applied from the lowest
 * to the highest handicap, players with the same handicap are ordered by their position in the array.
 */
export function buildTexasTeams(players: TexasPlayer[]): TexasTeam[] {

  return [...new Set(players.map(player => player.team))]
    .sort((t1, t2) => t1 - t2)
    .map(team => {

      const members = players.map((player, idx) => ({ player, idx }))
        .filter(item => item.player.team === team)
        .map(item => item.idx);

      const ordered = [...members].sort((p1, p2) => players[p1].hcp - players[p2].hcp || p1 - p2);
      const weights = TEXAS_SCRAMBLE_ALLOWANCES[members.length] ?? [];
      const allowances = members.map(member => weights[ordered.indexOf(member)] ?? 0);

      const hcp = Math.round(members.reduce((sum, member, i) => sum + players[member].hcp * allowances[i] / 100, 0));

      return { team, players: members, scorer: members[0], teeType: players[members[0]].teeType, hcp, allowances };
    });
}

/**
 * Handicap strokes per hole [team][hole].
 */
export function calculateTexasHoleHcp(teams: TexasTeam[], course: Course): number[][] {

  const holeHcp: number[][] = teams.map(() => new Array(HOLES).fill(0));
  teams.forEach((team, idx) => calculateHoleHCP(idx, team.teeType, team.hcp, holeHcp, course));
  return holeHcp;
}

/**
 * Css class highlighting the number of handicap strokes received on a hole.
 */
export function hcpStrokesClass(hcp: number): string {
  switch (hcp) {
    case 0:
      return '';
    case 1:
      return 'highlightHcp';
    case 2:
      return 'highlightHcp2';
    default:
      return 'highlightHcp3';
  }
}

/**
 * Net result of the teams. A team scores once, so the strokes of the team scorer are the team strokes.
 * @param strokes gross strokes [player][hole], undefined, null or 0 when the score is not entered
 * @param holeHcp team handicap strokes [team][hole]
 */
export function calculateTexasResult(teams: TexasTeam[],
                                     strokes: (number | null | undefined)[][],
                                     holeHcp: number[][]): FbspResult {

  return calculateFbspTeamResults(teams.map(team => strokes[team.scorer] ?? []),
                                  teams.map(team => team.team),
                                  holeHcp);
}

/**
 * Gross strokes sums [team].
 */
export function calculateTexasGrossSums(teams: TexasTeam[], strokes: (number | null | undefined)[][]): FbspPlayerSum[] {

  return teams.map(team => calculateFbspPlayerSum(strokes[team.scorer] ?? []));
}
