import { LeaderBoardPlayer } from "./leaderboard-json-types";
import {
  PlayerScorecardResponse,
  PlayerScorecardRound,
  PlayerScorecardShot
} from "./player-scorecard-types";

export interface Hole {
  id: number;
  par: number;
}

export interface PlayerAggregateRoundStats {
  readonly hio: number;
  readonly doubleEagle: number;
  readonly eagle: number;
  readonly birdie: number;
  readonly par: number;
  readonly bogey: number;
  readonly doubleBogey: number;
  readonly ballInWater: number;
  readonly missedGir: number;
  readonly outOfBounds: number;
  readonly threePutt: number;
  readonly bunker: number;
  readonly sandSave: number;
}

export interface PlayerAggregateRound {
  readonly id: number;
  readonly stats: PlayerAggregateRoundStats;
}
export interface PlayerAggregate {
  readonly id: string;
  readonly playerName: string;
  readonly rounds: ReadonlyArray<PlayerAggregateRound>;
}

export function getPlayerAggregates(
  holes: ReadonlyArray<Hole>,
  leaderBoardPlayer: LeaderBoardPlayer,
  playerScorecard: PlayerScorecardResponse
): PlayerAggregate {
  return {
    id: leaderBoardPlayer.player_id,
    playerName: `${leaderBoardPlayer.player_bio.first_name} ${
      leaderBoardPlayer.player_bio.last_name
    }`,
    rounds: getPlayerAggregateRounds(holes, playerScorecard)
  };
}

function getPlayerAggregateRounds(
  holes: ReadonlyArray<Hole>,
  playerScorecard: PlayerScorecardResponse
): ReadonlyArray<PlayerAggregateRound> {
  return playerScorecard.p.rnds.map(r => {
    const round = parseInt(r.n, 10);
    return {
      id: round,
      stats: getRoundStats(holes, r)
    };
  });
}

function getRoundStats(
  holes: ReadonlyArray<Hole>,
  playerScorecardRound: PlayerScorecardRound
): PlayerAggregateRoundStats {
  return playerScorecardRound.holes.reduce((soFar, scorecardHole) => {
    const holeId = parseInt(scorecardHole.cNum, 10);
    const holeInfo = holes[holeId - 1];

    // Check if player have yet finnished hole
    if (scorecardHole.sc.length === 0) {
      return soFar;
    }

    return mergeAggregateStats(
      soFar,
      calculateAggregateStatsForHole(holeInfo, scorecardHole.shots)
    );
  }, getEmptyAggregateStats());
}

function calculateAggregateStatsForHole(
  hole: Hole,
  shots: ReadonlyArray<PlayerScorecardShot>
): PlayerAggregateRoundStats {
  const numberOfShots = shots.length;
  const par = hole.par;
  const effective = numberOfShots - par;

  return {
    hio: numberOfShots === 1 ? 1 : 0,
    doubleEagle: effective === -3 ? 1 : 0,
    eagle: effective === -2 ? 1 : 0,
    birdie: effective === -1 ? 1 : 0,
    par: effective === 0 ? 1 : 0,
    bogey: effective === 1 ? 1 : 0,
    doubleBogey: effective >= 2 ? 1 : 0,
    ballInWater: shots.filter(s => s.to === "OWA").length,
    outOfBounds: shots.filter(s => s.to === "OTB" && s.t === "p").length,
    missedGir: shots.findIndex(s => s.to === "OGR") + 1 > par - 2 ? 1 : 0,
    threePutt: shots.findIndex(s => s.putt === "3") > -1 ? 1 : 0,
    bunker: shots.filter(s => s.to === "OST" || s.to.startsWith("EG")).length,
    sandSave: getSandSaves(shots)
  };
}

function mergeAggregateStats(
  a: PlayerAggregateRoundStats,
  b: PlayerAggregateRoundStats
): PlayerAggregateRoundStats {
  const keys: ReadonlyArray<keyof PlayerAggregateRoundStats> = Object.keys(
    a
  ) as any;
  return keys.reduce(
    (
      soFar: PlayerAggregateRoundStats,
      key: keyof PlayerAggregateRoundStats
    ) => {
      (soFar[key] as any) = a[key] + b[key];
      return soFar;
    },
    getEmptyAggregateStats()
  );
}

function getEmptyAggregateStats(): PlayerAggregateRoundStats {
  return {
    birdie: 0,
    bogey: 0,
    doubleBogey: 0,
    doubleEagle: 0,
    eagle: 0,
    hio: 0,
    par: 0,
    ballInWater: 0,
    missedGir: 0,
    outOfBounds: 0,
    threePutt: 0,
    bunker: 0,
    sandSave: 0
  };
}

function getSandSaves(shots: ReadonlyArray<PlayerScorecardShot>): number {
  const toGreenBunkerShot = shots
    .concat()
    .reverse()
    .find(s => s.to.startsWith("EG"));
  toGreenBunkerShot;
  if (toGreenBunkerShot === undefined) {
    return 0;
  }

  console.log("toGreenBunkerShot", toGreenBunkerShot);
  console.log("totalShots", shots.length);
  if (shots.length - parseInt(toGreenBunkerShot.n, 10) > 2) {
    console.log("No sandy");
    return 0;
  }

  // debugger;
  console.log("sandy");
  return 1;
}
