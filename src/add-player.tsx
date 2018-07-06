import * as React from "react";
import { LeaderboardPlayer } from "./leaderboard-json-types";
import { getPlayerName } from "./utilities";

interface Props {
  readonly players: ReadonlyArray<LeaderboardPlayer>;
  readonly updatePlayers: (players: ReadonlyArray<string>) => void;
  readonly addedPlayers: Set<string>;
}
interface State {
  readonly selected: string | undefined;
}

export class AddPlayer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selected: undefined
    };
  }
  render(): JSX.Element {
    const { addedPlayers, players, updatePlayers } = this.props;
    const validPlayers = players
      .filter(p => !addedPlayers.has(p.player_id))
      .map(p => ({
        id: p.player_id,
        name: getPlayerName(p)
      }))
      .sort((a, b) => ("" + a.name).localeCompare(b.name));

    const { selected = validPlayers[0].id } = this.state;
    const setState = this.setState.bind(this);
    return (
      <div>
        <select
          value={selected}
          onChange={e => {
            setState({
              selected: e.target.value
            });
          }}
        >
          {validPlayers.map(p => (
            <option value={p.id} key={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            updatePlayers(Array.from(addedPlayers.values()).concat(selected));
          }}
        >
          Add
        </button>
      </div>
    );
  }
}
