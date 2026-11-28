import { ballPickedUpStrokes } from './common';

const HOLES = 18;
const HALF = 9;

export interface FbspTeamResult {
  team: number;
  // indexes of the team players
  players: number[];
  // net result of the team per hole, undefined if not known yet
  holes: (number | undefined)[];
  front: number;
  back: number;
  total: number;
}

export interface FbspResult {
  teams: FbspTeamResult[];
  // true if the player's score counts for the team on the hole [player][hole]
  counting: boolean[][];
}

export interface FbspPlayerSum {
  front: number | null;
  back: number | null;
  total: number | null;
}

/**
 * Sums gross strokes of a player. A half with a picked up ball has no sum, so neither has the total.
 * @param strokes gross strokes per hole, undefined or null when the score is not entered
 */
export function calculateFbspPlayerSum(strokes: (number | null | undefined)[]): FbspPlayerSum {

  const half = (from: number): number | null => {
    const entered = strokes.slice(from, from + HALF).filter((stroke): stroke is number => stroke != null);
    return entered.includes(ballPickedUpStrokes) ? null : entered.reduce((sum, stroke) => sum + stroke, 0);
  };

  const front = half(0);
  const back = half(HALF);
  return { front, back, total: front === null || back === null ? null : front + back };
}

/**
 * Calculates four ball stroke play result.
 * @param strokes gross strokes [player][hole], undefined, null or 0 when the score is not entered
 * @param teams team number (1 or 2) per player
 * @param holeHcp handicap strokes received [player][hole]
 */
export function calculateFbspTeamResults(strokes: (number | null | undefined)[][],
                                         teams: number[],
                                         holeHcp: number[][]): FbspResult {

  const counting: boolean[][] = strokes.map(() => new Array(HOLES).fill(false));

  const teamResults = [1, 2]
    .map(team => ({
      team,
      players: teams.map((playerTeam, idx) => ({ playerTeam, idx }))
        .filter(item => item.playerTeam === team)
        .map(item => item.idx)
    }))
    .filter(teamInfo => teamInfo.players.length > 0)
    .map(teamInfo => {

      const holes: (number | undefined)[] = new Array(HOLES).fill(undefined);

      for (let hole = 0; hole < HOLES; hole++) {

        // the team result is known only after all players entered the score
        if (teamInfo.players.some(player => !strokes[player]?.[hole])) {
          continue;
        }

        const nets = teamInfo.players
          .filter(player => strokes[player][hole] < ballPickedUpStrokes)
          .map(player => ({ player, net: strokes[player][hole] - (holeHcp[player]?.[hole] ?? 0) }));

        if (nets.length === 0) {
          continue;
        }

        holes[hole] = Math.min(...nets.map(n => n.net));
        nets.filter(n => n.net === holes[hole]).forEach(n => counting[n.player][hole] = true);
      }

      const front = holes.slice(0, HALF).reduce((sum, net) => sum + (net ?? 0), 0);
      const back = holes.slice(HALF).reduce((sum, net) => sum + (net ?? 0), 0);

      return { ...teamInfo, holes, front, back, total: front + back };
    });

  return { teams: teamResults, counting };
}
