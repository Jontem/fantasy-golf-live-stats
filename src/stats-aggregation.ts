import { LeaderboardPlayer } from "./leaderboard-json-types";
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
  readonly fairwayHits: PlayerAggregateRoundStat;
  readonly missedPutt5Feet: PlayerAggregateRoundStat;
  readonly putt15To25Feet: PlayerAggregateRoundStat;
  readonly putt25Feet: PlayerAggregateRoundStat;
  readonly consecutiveBirdie: PlayerAggregateRoundStat;
}

export interface PlayerAggregateRound {
  readonly id: number;
  readonly finnished: boolean;
  readonly shots: number;
  readonly currentHole: number;
  readonly stats: PlayerAggregateRoundStats;
}
export interface PlayerAggregate {
  readonly rounds: ReadonlyArray<PlayerAggregateRound>;
}

export function getPlayerAggregates(
  holes: ReadonlyArray<Hole>,
  playerScorecard: PlayerScorecardResponse
): PlayerAggregate {
  return {
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
        .reduce(
          (soFar, current) => soFar + getCountableShots(current.shots).length,
          0
        ),
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
  return playerScorecardRound.holes
    .reduce(
      (soFar, scorecardHole) => {
        const holeId = parseInt(scorecardHole.cNum, 10);
        const holeInfo = holes[holeId - 1];

        // Check if player have yet finnished hole
        if (scorecardHole.sc.length === 0) {
          return soFar;
        }

        return soFar.concat(
          calculateAggregateStatsForHole(
            soFar[soFar.length - 1] || getEmptyAggregateStats(),
            holeInfo,
            scorecardHole.shots
          )
        );
      },
      [] as ReadonlyArray<PlayerAggregateRoundStats>
    )
    .reduce(
      (soFar, current) => mergeAggregateStats(soFar, current),
      getEmptyAggregateStats()
    );
}

function calculateAggregateStatsForHole(
  previous: PlayerAggregateRoundStats,
  hole: Hole,
  shots: ReadonlyArray<PlayerScorecardShot>
): PlayerAggregateRoundStats {
  const countableShots = getCountableShots(shots);
  const numberOfShots = countableShots.length;
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
      countableShots.filter(s => s.to === "OWA").length,
      hole.id
    ),
    outOfBounds: createPlayerAggregateRoundStat(
      countableShots.filter(s => s.to === "OTB" && s.t === "P").length,
      hole.id
    ),
    missedGir: createPlayerAggregateRoundStat(
      isGreenMiss(par, countableShots),
      hole.id
    ),
    threePutt: createPlayerAggregateRoundStat(
      countableShots.findIndex(s => s.putt === "3") > -1 ? 1 : 0,
      hole.id
    ),
    bunker: createPlayerAggregateRoundStat(
      shots.filter(s => s.to === "OST" || s.to.startsWith("EG")).length,
      hole.id
    ),
    sandSave: createPlayerAggregateRoundStat(
      getSandSaves(countableShots),
      hole.id
    ),
    fairwayHits: createPlayerAggregateRoundStat(
      isFairwayHit(hole, countableShots),
      hole.id
    ),
    missedPutt5Feet: createPlayerAggregateRoundStat(
      missedPut5Feet(countableShots),
      hole.id
    ),
    putt15To25Feet: createPlayerAggregateRoundStat(
      putt15To25Feet(countableShots),
      hole.id
    ),
    putt25Feet: createPlayerAggregateRoundStat(
      putt25Feet(countableShots),
      hole.id
    ),
    consecutiveBirdie: createPlayerAggregateRoundStat(
      (previous.hio.value ||
        previous.doubleEagle.value ||
        previous.eagle.value ||
        previous.birdie.value) === 1 && effective < 0
        ? 1
        : 0,
      hole.id
    )
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
    sandSave: { value: 0, holes: [] },
    fairwayHits: { value: 0, holes: [] },
    missedPutt5Feet: { value: 0, holes: [] },
    putt15To25Feet: { value: 0, holes: [] },
    putt25Feet: { value: 0, holes: [] },
    consecutiveBirdie: { value: 0, holes: [] }
  };
}

function isGreenMiss(
  holePar: number,
  countableShots: ReadonlyArray<PlayerScorecardShot>
): number {
  const firstShotOnGreen = countableShots.find(s => s.to === "OGR");
  if (firstShotOnGreen === undefined) {
    return 1;
  }
  const strokeCount = parseInt(firstShotOnGreen.n, 10);
  return strokeCount > holePar - 2 ? 1 : 0;
}

const fairwayRegex = /^E.F$/;
function isFairwayHit(
  hole: Hole,
  countableShots: ReadonlyArray<PlayerScorecardShot>
): number {
  if (hole.par < 4) {
    return 0;
  }

  return fairwayRegex.test(countableShots[0].to) ? 1 : 0;
}

function missedPut5Feet(
  countableShots: ReadonlyArray<PlayerScorecardShot>
): number {
  const lastShot = countableShots[countableShots.length - 1];

  const lastWasPutt = lastShot && lastShot.putt.length > 0;
  if (!lastWasPutt) {
    return 0;
  }
  // inches
  return countableShots.filter(s => s.putt.length > 0).some(s => {
    const puttDistance = parseInt(s.dist, 10);
    return inchesToFeet(puttDistance) < 5 && s.cup !== "y";
  })
    ? 1
    : 0;
}

function putt15To25Feet(
  countableShots: ReadonlyArray<PlayerScorecardShot>
): number {
  const lastShot = countableShots[countableShots.length - 1];
  const lastWasPutt = lastShot.putt.length > 0;
  if (!lastWasPutt) {
    return 0;
  }
  // inches
  const puttDistance = parseInt(lastShot.dist, 10);
  const puttDistanceFeet = inchesToFeet(puttDistance);
  return puttDistanceFeet >= 15 && puttDistanceFeet <= 25 ? 1 : 0;
}
function putt25Feet(
  countableShots: ReadonlyArray<PlayerScorecardShot>
): number {
  const lastShot = countableShots[countableShots.length - 1];
  const lastWasPutt = lastShot.putt.length > 0;
  if (!lastWasPutt) {
    return 0;
  }
  // inches
  const puttDistance = parseInt(lastShot.dist, 10);
  const puttDistanceFeet = inchesToFeet(puttDistance);
  return puttDistanceFeet > 25 ? 1 : 0;
}

function getSandSaves(
  countableShots: ReadonlyArray<PlayerScorecardShot>
): number {
  const toGreenBunkerShot = countableShots
    .concat()
    .reverse()
    .find(s => s.to.startsWith("EG"));
  toGreenBunkerShot;
  if (toGreenBunkerShot === undefined) {
    return 0;
  }

  if (countableShots.length - parseInt(toGreenBunkerShot.n, 10) > 2) {
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

function getCountableShots(
  shots: ReadonlyArray<PlayerScorecardShot>
): ReadonlyArray<PlayerScorecardShot> {
  return shots.filter(s => s.t !== "D");
}

function inchesToFeet(inches: number): number {
  return inches / 12;
}
