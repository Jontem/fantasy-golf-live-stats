export interface PlayerScorecardResponse {
  readonly id: string;
  readonly rnds: ReadonlyArray<PlayerScorecardRound>;
}

export interface PlayerScorecardRound {
  readonly n: string;
  readonly holes: ReadonlyArray<PlayerScorecardHole>;
}

export interface PlayerScorecardHole {
  readonly n: string;
  readonly shots: ReadonlyArray<PlayerScoreCardShot>;
}

export interface PlayerScoreCardShot {
  readonly n: string;
  readonly putt: "y" | "n";
  readonly cup: "y" | "n";
}
