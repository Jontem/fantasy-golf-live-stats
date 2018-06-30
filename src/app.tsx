import * as React from "react";
import { PlayerScorecardResponse } from "./player-scorecard-types";
import { LeaderBoardResponse } from "./leaderboard-json-types";
import { getPlayerAggregate, PlayerAggregate } from "./stats-aggregation";
import { mockPlayerData } from "./mock-data";

// const leaderboardReponse: LeaderBoardResponse = require("../leaderboard.json");
const leaderboardUrl =
  "https://statdata.pgatour.com/r/471/2018/leaderboard-v2.json";

const getPlayerScorecardUrl = (playerId: string) =>
  `https://statdata.pgatour.com/r/471/2018/scorecards/${playerId}.json`;

const players = ["25198", "25632", "29420", "08793"];

/* const holes = leaderboardReponse.leaderboard.courses[0].holes.map(h => ({
  id: h.hole_id,
  par: h.round[0].par
}));

const playerAggregates = ["25198", "25632", "29420", "08793"].map(pId => {
  const leaderboardPlayer = leaderboardReponse.leaderboard.players.find(
    p => p.player_id === pId
  )!;
  const playerScorecard: PlayerScorecardResponse = mockPlayerData[pId];
  console.log(playerScorecard);
  return getPlayerAggregate(holes, leaderboardPlayer, playerScorecard);
}); */

interface Props {}

interface State {
  readonly leaderboard: LeaderBoardResponse | undefined;
  readonly playerAggregates: ReadonlyArray<PlayerAggregate> | undefined;
}

export class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      leaderboard: undefined,
      playerAggregates: undefined
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
          return getPlayerAggregate(holes, leaderboardPlayer, r);
        });

        this.setState({
          leaderboard,
          playerAggregates
        });
      })
      .catch(error => {
        console.error(error);
      });
  }

  render() {
    const { playerAggregates } = this.state;
    if (playerAggregates === undefined) {
      return (
        <div>
          <h1>Loading...</h1>
        </div>
      );
    }
    //   console.log(playerData);
    return (
      <div>
        <h1>Stats</h1>
        <MyPlayers playerAggregates={playerAggregates} />
        {/* <PlayerTable players={playerData.tournament.players} /> */}
      </div>
    );
  }
}

interface MyPlayersProps {
  readonly playerAggregates: ReadonlyArray<PlayerAggregate>;
}

function MyPlayers({ playerAggregates }: MyPlayersProps) {
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
        <th>Out of bounds</th>
        <th>missed gir</th>
        <th>three putt</th>
        <th>bunker</th>
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
              <td>{playerAggregate.stats.outOfBounds}</td>
              <td>{playerAggregate.stats.missedGir}</td>
              <td>{playerAggregate.stats.threePutt}</td>
              <td>{playerAggregate.stats.bunker}</td>
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
