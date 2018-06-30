export interface PlayerResponse {
  readonly tournament: PlayerTournament;
}

export interface PlayerTournament {
  readonly tournamentNumber: string;
  readonly players: ReadonlyArray<Player>;
}

export interface Player {
  readonly pid: string;
  readonly pn: string;
  readonly stats: ReadonlyArray<PlayerStat>;
}

interface PlayerStat {
  readonly statId: string;
  readonly name: string;
  readonly tValue: string;
  readonly cValue: string;
}
