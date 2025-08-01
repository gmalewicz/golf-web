export interface TournamentRound {
  id?: number;
  courseName: string;
  scrDiff: number;
  stbGross: number;
  stbNet: number;
  strokesBrutto: number;
  strokesNetto: number;
  strokes: boolean;
  nick?: string;
  roundId?: number;
  playingHcp: number;
  hcp: number;
  courseHcp: number;
}

