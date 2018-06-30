import { LeaderBoardPlayer } from "./leaderboard-json-types";

export interface PlayerAggregate {
  readonly id: string;
  readonly playerName: string;
}

export function getPlayerAggregate(
  leaderBoardPlayer: LeaderBoardPlayer
): PlayerAggregate {
  return {
    id: leaderBoardPlayer.player_id,
    playerName: `${leaderBoardPlayer.player_bio.first_name} ${
      leaderBoardPlayer.player_bio.last_name
    }`
  };
}
