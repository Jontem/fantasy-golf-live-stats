import * as React from "react";
import { PlayerAggregateRoundStats } from "./stats-aggregation";
import { perfomanceMultiplier } from "./calculate-points";
import { Points } from "./elements";

interface ValueRowProps {
  readonly stats: PlayerAggregateRoundStats;
  readonly statKey: keyof PlayerAggregateRoundStats;
}

export function ValueRow({ statKey, stats }: ValueRowProps): JSX.Element {
  const { holes, value } = stats[statKey];
  return (
    <td title={holes.join(", ")}>
      {value}
      <Points>
        {" "}
        (
        {value * perfomanceMultiplier[statKey]}
        )
      </Points>
    </td>
  );
}
