import { OnlineRound } from "@/scorecard/_models/onlineRound";

export function updateStartingHole(onlineRound: OnlineRound) {
  const retScoreCardAPI = onlineRound.scoreCardAPI;

  onlineRound.scoreCardAPI = new Array(18).fill(null);

  onlineRound.first9score = 0;
  onlineRound.last9score = 0;

  retScoreCardAPI.forEach((scoreCardAPI) => {
    onlineRound.scoreCardAPI[scoreCardAPI.hole - 1] = scoreCardAPI;
    if (scoreCardAPI.hole < 10) {
      onlineRound.first9score += scoreCardAPI.stroke;
    } else {
      onlineRound.last9score += scoreCardAPI.stroke;
    }
  });
}
