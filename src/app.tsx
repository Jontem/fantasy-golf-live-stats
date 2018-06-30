import * as React from "react";
import { PlayerScorecardResponse } from "./player-scorecard-types";
import { LeaderBoardResponse } from "./leaderboard-json-types";
import { getPlayerAggregate, PlayerAggregate } from "./stats-aggregation";
import { mockPlayerData } from "./mock-data";

const leaderboardReponse: LeaderBoardResponse = require("../leaderboard.json");

const holes = leaderboardReponse.leaderboard.courses[0].holes.map(h => ({
  id: h.hole_id,
  par: h.round[0].par
}));

const playerAggregates = ["25198", "25632", "29420"].map(pId => {
  const leaderboardPlayer = leaderboardReponse.leaderboard.players.find(
    p => p.player_id === pId
  )!;
  const playerScorecard: PlayerScorecardResponse = mockPlayerData[pId];
  console.log(playerScorecard);
  return getPlayerAggregate(holes, leaderboardPlayer, playerScorecard);
});

interface Props {}

export function App({  }: Props): JSX.Element {
  //   console.log(playerData);
  return (
    <div>
      <h1>Stats</h1>
      <MyPlayers playerAggregates={playerAggregates} />
      {/* <PlayerTable players={playerData.tournament.players} /> */}
    </div>
  );
}

interface MyPlayersProps {
  readonly playerAggregates: ReadonlyArray<PlayerAggregate>;
}

function MyPlayers({ playerAggregates }: MyPlayersProps) {
  console.log(leaderboardReponse);
  return (
    <table>
      <thead>
        <th>Player</th>
        <th>hio</th>
        <th>doubleEagle</th>
        <th>eagle</th>
        <th>birde</th>
        <th>par</th>
        <th>bogey</th>
        <th>doubleBogey</th>
        <th>ball in water</th>
        <th>missed gir</th>
      </thead>
      <tbody>
        {playerAggregates.map(playerAggregate => {
          return (
            <tr key={playerAggregate.id}>
              <td>{playerAggregate.playerName}</td>
              <td>{playerAggregate.stats.hio}</td>
              <td>{playerAggregate.stats.doubleEagle}</td>
              <td>{playerAggregate.stats.eagle}</td>
              <td>{playerAggregate.stats.birde}</td>
              <td>{playerAggregate.stats.par}</td>
              <td>{playerAggregate.stats.bogey}</td>
              <td>{playerAggregate.stats.doubleBogey}</td>
              <td>{playerAggregate.stats.ballInWater}</td>
              <td>{playerAggregate.stats.missedGir}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/* interface PlayerTableProps {
  readonly players: ReadonlyArray<Player>;
}

function PlayerTable({ players }: PlayerTableProps): JSX.Element {
  return (
    <table>
      <thead>
        <th>Player</th>
        {players[0].stats.map(s => <th>{s.name}</th>)}
      </thead>
      <tbody>
        {players.map(p => (
          <tr key={p.pid}>
            <td>{p.pn}</td>
            {p.stats.map(s => <td key={s.statId}>{s.tValue}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
 */
