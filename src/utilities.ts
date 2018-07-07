import { LeaderboardPlayer } from "./leaderboard-json-types";

export function getPlayerName(leaderboardPlayer: LeaderboardPlayer): string {
  return `${leaderboardPlayer.player_bio.first_name} ${
    leaderboardPlayer.player_bio.last_name
  }`;
}

export function getPlayerUrl(playerId: string): string {
  return `https://pga-tour-res.cloudinary.com/image/upload/w_200/headshots_${playerId}.png`;
}
