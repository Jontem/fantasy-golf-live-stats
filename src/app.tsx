import * as React from "react";
import { PlayerScorecardResponse } from "./player-scorecard-types";
import { LeaderBoardResponse } from "./leaderboard-json-types";
import {
  getPlayerAggregates,
  PlayerAggregate,
  Hole
} from "./stats-aggregation";
import { PlayerInfo } from "./player-info";

const leaderboardUrl =
  "https://statdata.pgatour.com/r/490/2018/leaderboard-v2.json";

const getPlayerScorecardUrl = (playerId: string) =>
  `https://statdata.pgatour.com/r/490/2018/scorecards/${playerId}.json`;

// const players = ["29461", "25198" /* "25632", "29420", "08793" */];
const players = ["29221"];

interface Props {}

interface State {
  readonly leaderboard: LeaderBoardResponse | undefined;
  readonly playerAggregates: ReadonlyArray<PlayerAggregate> | undefined;
  readonly holes: ReadonlyArray<Hole> | undefined;
}

export class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      leaderboard: undefined,
      playerAggregates: undefined,
      holes: undefined
    };
  }

  componentDidCatch?(error: Error, errorInfo: React.ErrorInfo) {
    console.log(error);
    console.log(errorInfo);
  }

  componentDidMount() {
    const promises = [
      fetch(leaderboardUrl).then(res => res.json()),
      ...players.map(s =>
        fetch(getPlayerScorecardUrl(s)).then(res => res.json())
      )
    ];

    Promise.all(promises)
      .then(datas => {
        try {
          const [leaderboard, ...playerScorecardResponses] = datas;
          const leaderboardReponse = leaderboard as LeaderBoardResponse;

          const holes = leaderboardReponse.leaderboard.courses[0].holes.map(
            h => ({
              id: h.hole_id,
              par: h.round[0].par
            })
          );

          const playerAggregates = (playerScorecardResponses as ReadonlyArray<
            PlayerScorecardResponse
          >).map(r => {
            const playerId = r.p.id;
            const leaderboardPlayer = leaderboardReponse.leaderboard.players.find(
              p => p.player_id === playerId
            )!;
            console.log(r);
            return getPlayerAggregates(holes, leaderboardPlayer, r);
          });

          this.setState({
            leaderboard,
            playerAggregates,
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
    const { holes, playerAggregates } = this.state;
    if (holes === undefined || playerAggregates === undefined) {
      return (
        <div>
          <h1>Loading...</h1>
        </div>
      );
    }

    return (
      <div>
        <h1>Stats</h1>
        <MyPlayers playerAggregates={playerAggregates} holes={holes} />
        {/* <PlayerTable players={playerData.tournament.players} /> */}
      </div>
    );
  }
}

interface MyPlayersProps {
  readonly playerAggregates: ReadonlyArray<PlayerAggregate>;
  readonly holes: ReadonlyArray<Hole>;
}

function MyPlayers({ holes, playerAggregates }: MyPlayersProps) {
  return (
    <div>
      {playerAggregates.map(p => (
        <PlayerInfo key={p.id} playerAggregate={p} holes={holes} />
      ))}
    </div>
  );
}
