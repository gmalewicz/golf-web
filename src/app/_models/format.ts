export const Format = {
  STROKE_PLAY: 0,
  MATCH_PLAY: 1,
  FOUR_BALL_STROKE_PLAY: 2,
  FOUR_BALL_MATCH_PLAY: 3,
  TEXAS_SCRAMBLE: 4
};

export type Format = (typeof Format)[keyof typeof Format]; 