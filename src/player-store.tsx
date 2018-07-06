import * as React from "react";

interface Props {
  readonly children: (childProps: State) => JSX.Element;
}

export type UpdatePlayers = (players: ReadonlyArray<string>) => void;

interface State {
  readonly players: ReadonlyArray<string>;
  readonly updatePlayers: UpdatePlayers;
}

const localStorageKey = "savedPlayers";

export class PlayerStore extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const savedPlayers: ReadonlyArray<string> = JSON.parse(
      localStorage.getItem(localStorageKey) || "[]"
    );

    this.state = {
      players: savedPlayers,
      updatePlayers: ((players: ReadonlyArray<string>) => {
        localStorage.setItem(localStorageKey, JSON.stringify(players));
        this.setState({
          players
        });
      }).bind(this)
    };
  }
  render() {
    return React.Children.only(this.props.children(this.state));
  }
}
