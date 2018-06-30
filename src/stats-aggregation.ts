import { LeaderBoardPlayer } from "./leaderboard-json-types";

export interface PlayerAggregate {
  readonly id: string;
  readonly playerName: string;
  readonly stats: {
    readonly hio: number;
    readonly doubleEagle: number;
    readonly eagle: number;
    readonly birde: number;
    readonly par: number;
    readonly bogey: number;
    readonly doubleBogey: number;
  };
}

export function getPlayerAggregate(
  leaderBoardPlayer: LeaderBoardPlayer
): PlayerAggregate {
  return {
    id: leaderBoardPlayer.player_id,
    playerName: `${leaderBoardPlayer.player_bio.first_name} ${
      leaderBoardPlayer.player_bio.last_name
    }`,
    stats: {
      birde: 0,
      bogey: 0,
      doubleBogey: 0,
      doubleEagle: 0,
      eagle: 0,
      hio: 0,
      par: 0
    }
  };
}
