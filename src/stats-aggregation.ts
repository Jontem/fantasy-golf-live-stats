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

export interface PlayerAggregateStats {
  readonly hio: number;
  readonly doubleEagle: number;
  readonly eagle: number;
  readonly birde: number;
  readonly par: number;
  readonly bogey: number;
  readonly doubleBogey: number;
  readonly ballInWater: number;
  readonly missedGir: number;
}
export interface PlayerAggregate {
  readonly id: string;
  readonly playerName: string;
  readonly stats: PlayerAggregateStats;
}

export function getPlayerAggregate(
  holes: ReadonlyArray<Hole>,
  leaderBoardPlayer: LeaderBoardPlayer,
  playerScorecard: PlayerScorecardResponse
): PlayerAggregate {
  return {
    id: leaderBoardPlayer.player_id,
    playerName: `${leaderBoardPlayer.player_bio.first_name} ${
      leaderBoardPlayer.player_bio.last_name
    }`,
    stats: getPlayerAggregateStats(holes, playerScorecard)
  };
}

function getPlayerAggregateStats(
  holes: ReadonlyArray<Hole>,
  playerScorecard: PlayerScorecardResponse
): PlayerAggregateStats {
  const roundStats = playerScorecard.p.rnds.map(r => getRoundStats(holes, r));
  return roundStats.reduce(mergeAggregateStats);
}

function getRoundStats(
  holes: ReadonlyArray<Hole>,
  playerScorecardRound: PlayerScorecardRound
): PlayerAggregateStats {
  return playerScorecardRound.holes.reduce((soFar, scorecardHole) => {
    const holeId = parseInt(scorecardHole.cNum, 10);
    const holeInfo = holes[holeId - 1];
    return mergeAggregateStats(
      soFar,
      calculateAggregateStatsForHole(holeInfo, scorecardHole.shots)
    );
  }, getEmptyAggregateStats());
}

function calculateAggregateStatsForHole(
  hole: Hole,
  shots: ReadonlyArray<PlayerScorecardShot>
): PlayerAggregateStats {
  const numberOfShots = shots.length;
  const par = hole.par;
  const effective = numberOfShots - par;
  return {
    birde: effective === -1 ? 1 : 0,
    bogey: effective === 1 ? 1 : 0,
    doubleBogey: effective >= 2 ? 1 : 0,
    doubleEagle: effective === 3 ? 1 : 0,
    eagle: effective === -2 ? 1 : 0,
    hio: numberOfShots === 1 ? 1 : 0,
    par: effective === 0 ? 1 : 0,
    ballInWater: shots.filter(s => s.to === "OWA").length,
    missedGir: shots.findIndex(s => s.to === "OGR") + 1 > par - 2 ? 1 : 0
  };
}

function mergeAggregateStats(
  a: PlayerAggregateStats,
  b: PlayerAggregateStats
): PlayerAggregateStats {
  const keys: ReadonlyArray<keyof PlayerAggregateStats> = Object.keys(a) as any;
  return keys.reduce(
    (soFar: PlayerAggregateStats, key: keyof PlayerAggregateStats) => {
      (soFar[key] as any) = a[key] + b[key];
      return soFar;
    },
    getEmptyAggregateStats()
  );
}

function getEmptyAggregateStats(): PlayerAggregateStats {
  return {
    birde: 0,
    bogey: 0,
    doubleBogey: 0,
    doubleEagle: 0,
    eagle: 0,
    hio: 0,
    par: 0,
    ballInWater: 0,
    missedGir: 0
  };
}
