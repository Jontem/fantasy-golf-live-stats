import * as React from "react";
import { PlayerResponse, Player } from "./player-json-types";
import { LeaderBoardResponse } from "./leaderboard-json-types";
import { getPlayerAggregate, PlayerAggregate } from "./stats-aggregation";

const playerData: PlayerResponse = require("../player.json");
const leaderboardReponse: LeaderBoardResponse = require("../leaderboard.json");

const playerAggregates = ["25198", "25632", "29420"].map(pId => {
  const leaderboardPlayer = leaderboardReponse.leaderboard.players.find(
    p => p.player_id === pId
  )!;
  return getPlayerAggregate(leaderboardPlayer);
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
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

interface PlayerTableProps {
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
