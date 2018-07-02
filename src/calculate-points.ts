import { exhaustiveCheck } from "ts-exhaustive-check";
import {
  PlayerAggregateRound,
  PlayerAggregateRoundStats
} from "./stats-aggregation";

export const perfomanceMultiplier = Object.freeze({
  hio: 25,
  doubleEagle: 15,
  eagle: 7,
  birdie: 3,
  par: 1,
  bogey: -1,
  doubleBogey: -4,
  ballInWater: -7,
  outOfBounds: -10,
  threePutt: -3,
  missedGir: -1,
  sandSave: 2,
  bunker: -1,
  fairwayHits: 1,
  missedPutt5Feet: -2,
  putt15To25Feet: 3,
  putt25Feet: 6,
  under70: 4,
  under65: 10
});

export function calculatePoints(round: PlayerAggregateRound): number {
  const keys: ReadonlyArray<keyof PlayerAggregateRoundStats> = Object.keys(
    round.stats
  ) as any;

  const roundStatsPoints = getShotPoints(round);

  return (
    roundStatsPoints +
    keys.reduce((soFar, current) => soFar + getPoints(round.stats, current), 0)
  );
}

export function getShotPoints(round: PlayerAggregateRound): number {
  let points = 0;

  if (!round.finnished) {
    return 0;
  }

  if (round.shots < 65) {
    points += perfomanceMultiplier.under65;
  }

  if (round.shots >= 65 && round.shots < 70) {
    points += perfomanceMultiplier.under70;
  }
  return points;
}

function getPoints(
  stats: PlayerAggregateRoundStats,
  key: keyof PlayerAggregateRoundStats
): number {
  switch (key) {
    case "hio": {
      return stats[key].value * perfomanceMultiplier.hio;
    }
    case "doubleEagle": {
      return stats[key].value * perfomanceMultiplier.doubleEagle;
    }
    case "eagle": {
      return stats[key].value * perfomanceMultiplier.eagle;
    }
    case "birdie": {
      return stats[key].value * perfomanceMultiplier.birdie;
    }
    case "par": {
      return stats[key].value * perfomanceMultiplier.par;
    }
    case "bogey": {
      return stats[key].value * perfomanceMultiplier.bogey;
    }
    case "doubleBogey": {
      return stats[key].value * perfomanceMultiplier.doubleBogey;
    }
    case "ballInWater": {
      return stats[key].value * perfomanceMultiplier.ballInWater;
    }
    case "outOfBounds": {
      return stats[key].value * perfomanceMultiplier.outOfBounds;
    }
    case "threePutt": {
      return stats[key].value * perfomanceMultiplier.threePutt;
    }
    case "missedGir": {
      return stats[key].value * perfomanceMultiplier.missedGir;
    }
    case "sandSave": {
      return stats[key].value * perfomanceMultiplier.sandSave;
    }
    case "bunker": {
      return stats[key].value * perfomanceMultiplier.bunker;
    }
    case "fairwayHits": {
      return stats[key].value * perfomanceMultiplier.fairwayHits;
    }
    case "missedPutt5Feet": {
      return stats[key].value * perfomanceMultiplier.missedPutt5Feet;
    }
    case "putt15To25Feet": {
      return stats[key].value * perfomanceMultiplier.putt15To25Feet;
    }
    case "putt25Feet": {
      return stats[key].value * perfomanceMultiplier.putt25Feet;
    }
    default: {
      exhaustiveCheck(key);
      throw new Error("Can't get points, key: " + key);
    }
  }
}
