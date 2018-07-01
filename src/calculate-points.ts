import { exhaustiveCheck } from "ts-exhaustive-check";
import {
  PlayerAggregateRound,
  PlayerAggregateRoundStats
} from "./stats-aggregation";

export function calculatePoints(round: PlayerAggregateRound): number {
  const keys: ReadonlyArray<keyof PlayerAggregateRoundStats> = Object.keys(
    round.stats
  ) as any;

  return keys.reduce(
    (soFar, current) => soFar + getPoints(round.stats, current),
    0
  );
}

function getPoints(
  stats: PlayerAggregateRoundStats,
  key: keyof PlayerAggregateRoundStats
): number {
  switch (key) {
    case "hio": {
      return stats[key] * 25;
    }
    case "doubleEagle": {
      return stats[key] * 15;
    }
    case "eagle": {
      return stats[key] * 7;
    }
    case "birdie": {
      return stats[key] * 3;
    }
    case "par": {
      return stats[key] * 1;
    }
    case "bogey": {
      return stats[key] * -1;
    }
    case "doubleBogey": {
      return stats[key] * -4;
    }
    case "ballInWater": {
      return stats[key] * -7;
    }
    case "outOfBounds": {
      return stats[key] * -10;
    }
    case "threePutt": {
      return stats[key] * -3;
    }
    case "missedGir": {
      return stats[key] * -1;
    }
    case "sandSave": {
      return stats[key] * 2;
    }
    case "bunker": {
      return stats[key] * -1;
    }
    default: {
      exhaustiveCheck(key);
      throw new Error("Can't get points, key: " + key);
    }
  }
}
