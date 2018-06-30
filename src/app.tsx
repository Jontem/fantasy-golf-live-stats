import * as React from "react";
import { PlayerData, Player } from "./player-json-types";

const playerData: PlayerData = require("../player.json");

interface Props {}

export function App({  }: Props): JSX.Element {
  //   console.log(playerData);
  return (
    <div>
      <h1>Stats</h1>
      <PlayerTable players={playerData.tournament.players} />
    </div>
  );
}

interface PlayerTableProps {
  readonly players: ReadonlyArray<Player>;
}
export function PlayerTable({ players }: PlayerTableProps): JSX.Element {
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
