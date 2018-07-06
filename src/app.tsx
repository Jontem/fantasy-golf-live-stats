import * as React from "react";
import { LeaderBoardResponse } from "./leaderboard-json-types";
import { Hole } from "./stats-aggregation";
import { PlayerStore } from "./player-store";
import { PlayerInfo } from "./player-info";
import { AddPlayer } from "./add-player";

const leaderboardUrl =
  "https://statdata.pgatour.com/r/490/2018/leaderboard-v2.json";

interface Props {}

interface State {
  readonly leaderboard: LeaderBoardResponse | undefined;
  readonly holes: ReadonlyArray<Hole> | undefined;
}

export class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      leaderboard: undefined,
      holes: undefined
    };
  }

  componentDidCatch?(error: Error, errorInfo: React.ErrorInfo) {
    console.log(error);
    console.log(errorInfo);
  }

  componentDidMount() {
    fetch(leaderboardUrl)
      .then(res => res.json())
      .then(leaderboard => {
        try {
          const leaderboardReponse = leaderboard as LeaderBoardResponse;

          const holes = leaderboardReponse.leaderboard.courses[0].holes.map(
            h => ({
              id: h.hole_id,
              par: h.round[0].par
            })
          );

          this.setState({
            leaderboard,
            holes
          });
        } catch (e) {
          debugger;
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  render() {
    const { holes, leaderboard } = this.state;
    if (holes === undefined || leaderboard === undefined) {
      return (
        <div>
          <h1>Loading...</h1>
        </div>
      );
    }

    return (
      <PlayerStore>
        {({ players, updatePlayers }) => (
          <div>
            <h1>Stats</h1>
            <div>
              {players.map(playerId => {
                const leaderboardPlayer = leaderboard.leaderboard.players.find(
                  p => p.player_id === playerId
                )!;
                return (
                  <PlayerInfo
                    playerId={leaderboardPlayer.player_id}
                    holes={holes}
                    leaderboardPlayer={leaderboardPlayer}
                  />
                );
              })}
            </div>
            <AddPlayer
              addedPlayers={new Set(players)}
              players={leaderboard.leaderboard.players}
              updatePlayers={updatePlayers}
            />
          </div>
        )}
      </PlayerStore>
    );
  }
}
