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
