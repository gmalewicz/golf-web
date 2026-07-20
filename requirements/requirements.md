# Requirements

| ID    | Description |
|-------|-------------|
| CR-01 | Display tee for each round that is part of tournament and is displayed on tournament results screen after displaying individual rounds. The tee name shall be displayed after Strokes Net. |
| CR-02 | Add possibility to change tee on edit scorecard screen (addScorecard). |
| CR-03 | Allow the tournament owner to edit a round that has been assigned to their tournament, without any backend changes. When the round is saved, it shall automatically be removed from the tournament and re-added. Editing by the tournament owner is permitted only while the tournament is not closed. The round owner shall not be able to edit a round that belongs to a tournament. |
| CR-04 | Update historical round results for `round-view-fb-mp`. Players shall be assigned to a team based on the `team` field (optional, but mandatory for that format) in `PlayerRoundDetails`. Currently players are assigned to teams arbitrarily. |
| CR-05 | In the cycle results table, add two additional columns after the player's position indicator. The first column shall display an up arrow (▲) if the player has improved their position after adding the latest tournament, a down arrow (▼) if the position has worsened, or a circle (●) if the position is unchanged. The second column shall display the number of positions gained (positive) or lost (negative), or remain empty if the position has not changed. The backend shall return the player's previous position in a new field `oldPlace` within the `CycleResult` interface, for each series. |


