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
  readonly putt: "3";
  readonly cup: "y" | "n";
  readonly t: "s" /* stroke */ | "p" /* penalty */;
  to:
    | "OWA" /* Water */
    | "OGR" /* GREEN */
    | "OTB" /* To bound?  when t = p and to = OTB, ot of bounds?*/;
}
