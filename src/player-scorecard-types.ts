export interface PlayerScorecardResponse {
  readonly p: {
    readonly id: string;
    readonly rnds: ReadonlyArray<PlayerScorecardRound>;
  };
}

export interface PlayerScorecardRound {
  readonly n: string;
  readonly holes: ReadonlyArray<PlayerScorecardHole>;
}

export interface PlayerScorecardHole {
  readonly cNum: string;
  readonly shots: ReadonlyArray<PlayerScorecardShot>;
}

export interface PlayerScorecardShot {
  readonly n: string;
  readonly putt: "y" | "n";
  readonly cup: "y" | "n";
}
