import { LeaderboardPlayer } from "./leaderboard-json-types";

export function getPlayerName(leaderboardPlayer: LeaderboardPlayer): string {
  return `${leaderboardPlayer.player_bio.first_name} ${
    leaderboardPlayer.player_bio.last_name
  }`;
}
