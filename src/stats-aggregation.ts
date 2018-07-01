import { LeaderBoardPlayer } from "./leaderboard-json-types";
import {
  PlayerScorecardResponse,
  PlayerScorecardRound,
  PlayerScorecardShot,
  PlayerScorecardHole
} from "./player-scorecard-types";

export interface Hole {
  id: number;
  par: number;
}
export interface PlayerAggregateRoundStat {
  readonly value: number;
  readonly holes: ReadonlyArray<number>;
}
export interface PlayerAggregateRoundStats {
  readonly hio: PlayerAggregateRoundStat;
  readonly doubleEagle: PlayerAggregateRoundStat;
  readonly eagle: PlayerAggregateRoundStat;
  readonly birdie: PlayerAggregateRoundStat;
  readonly par: PlayerAggregateRoundStat;
  readonly bogey: PlayerAggregateRoundStat;
  readonly doubleBogey: PlayerAggregateRoundStat;
  readonly ballInWater: PlayerAggregateRoundStat;
  readonly missedGir: PlayerAggregateRoundStat;
  readonly outOfBounds: PlayerAggregateRoundStat;
  readonly threePutt: PlayerAggregateRoundStat;
  readonly bunker: PlayerAggregateRoundStat;
  readonly sandSave: PlayerAggregateRoundStat;
}

export interface PlayerAggregateRound {
  readonly id: number;
  readonly finnished: boolean;
  readonly shots: number;
  readonly currentHole: number;
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
      shots: r.holes
        .filter(h => h.sc.length > 0)
        .reduce((soFar, current) => soFar + current.shots.length, 0),
      finnished: r.holes.every(h => h.sc.length > 0),
      currentHole: getCurrentHole(r.holes),
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
    hio: createPlayerAggregateRoundStat(numberOfShots === 1 ? 1 : 0, hole.id),
    doubleEagle: createPlayerAggregateRoundStat(
      effective === -3 ? 1 : 0,
      hole.id
    ),
    eagle: createPlayerAggregateRoundStat(effective === -2 ? 1 : 0, hole.id),
    birdie: createPlayerAggregateRoundStat(effective === -1 ? 1 : 0, hole.id),
    par: createPlayerAggregateRoundStat(effective === 0 ? 1 : 0, hole.id),
    bogey: createPlayerAggregateRoundStat(effective === 1 ? 1 : 0, hole.id),
    doubleBogey: createPlayerAggregateRoundStat(
      effective >= 2 ? 1 : 0,
      hole.id
    ),
    ballInWater: createPlayerAggregateRoundStat(
      shots.filter(s => s.to === "OWA").length,
      hole.id
    ),
    outOfBounds: createPlayerAggregateRoundStat(
      shots.filter(s => s.to === "OTB" && s.t === "p").length,
      hole.id
    ),
    missedGir: createPlayerAggregateRoundStat(
      shots.findIndex(s => s.to === "OGR") + 1 > par - 2 ? 1 : 0,
      hole.id
    ),
    threePutt: createPlayerAggregateRoundStat(
      shots.findIndex(s => s.putt === "3") > -1 ? 1 : 0,
      hole.id
    ),
    bunker: createPlayerAggregateRoundStat(
      shots.filter(s => s.to === "OST" || s.to.startsWith("EG")).length,
      hole.id
    ),
    sandSave: createPlayerAggregateRoundStat(getSandSaves(shots), hole.id)
  };
}

function createPlayerAggregateRoundStat(
  value: number,
  hole: number
): PlayerAggregateRoundStat {
  if (value === 0) {
    return {
      holes: [],
      value: 0
    };
  }

  return {
    value,
    holes: [hole]
  };
}

function mergeAggregateStats(
  a: PlayerAggregateRoundStats,
  b: PlayerAggregateRoundStats
): PlayerAggregateRoundStats {
  const keys: ReadonlyArray<keyof PlayerAggregateRoundStats> = Object.keys(
    a
  ) as any;

  let newStat = getEmptyAggregateStats();

  for (const key of keys) {
    newStat = {
      ...newStat,
      [key]: {
        value: a[key].value + b[key].value,
        holes: [...a[key].holes, ...b[key].holes]
      }
    };
  }

  return newStat;
}

function getEmptyAggregateStats(): PlayerAggregateRoundStats {
  return {
    birdie: { value: 0, holes: [] },
    bogey: { value: 0, holes: [] },
    doubleBogey: { value: 0, holes: [] },
    doubleEagle: { value: 0, holes: [] },
    eagle: { value: 0, holes: [] },
    hio: { value: 0, holes: [] },
    par: { value: 0, holes: [] },
    ballInWater: { value: 0, holes: [] },
    missedGir: { value: 0, holes: [] },
    outOfBounds: { value: 0, holes: [] },
    threePutt: { value: 0, holes: [] },
    bunker: { value: 0, holes: [] },
    sandSave: { value: 0, holes: [] }
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

  if (shots.length - parseInt(toGreenBunkerShot.n, 10) > 2) {
    return 0;
  }

  return 1;
}

function getCurrentHole(holes: ReadonlyArray<PlayerScorecardHole>): number {
  const currentHole = holes
    .concat()
    .reverse()
    .find(h => h.sc.length > 0);

  if (currentHole) {
    const holeNumber = parseInt(currentHole.cNum, 10);
    return holeNumber === 18 ? 18 : holeNumber + 1;
  }

  return 1;
}
