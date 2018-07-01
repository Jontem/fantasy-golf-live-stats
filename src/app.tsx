import * as React from "react";
import styled from "styled-components";
import { PlayerScorecardResponse } from "./player-scorecard-types";
import { LeaderBoardResponse } from "./leaderboard-json-types";
import { getPlayerAggregates, PlayerAggregate } from "./stats-aggregation";
import { calculatePoints } from "./calculate-points";

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
          return getPlayerAggregates(holes, leaderboardPlayer, r);
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

const StatsTable = styled.table`
  table-layout: fixed;
  border: 1px solid purple;
  border-collapse: collapse;

  td,
  th {
    padding: 5px;
    text-align: center;
  }
`;

interface MyPlayersProps {
  readonly playerAggregates: ReadonlyArray<PlayerAggregate>;
}

function MyPlayers({ playerAggregates }: MyPlayersProps) {
  return (
    <div>
      {playerAggregates.map(p => (
        <PlayerAggregate key={p.id} playerAggregate={p} />
      ))}
    </div>
  );
}

interface PlayerAggregateProps {
  readonly playerAggregate: PlayerAggregate;
}

function PlayerAggregate({
  playerAggregate: { playerName, rounds }
}: PlayerAggregateProps): JSX.Element {
  return (
    <div>
      <h2>{playerName}</h2>
      <StatsTable>
        <thead>
          <th />
          <th>Hio</th>
          <th>Double eagle</th>
          <th>Eagle</th>
          <th>Birde</th>
          <th>Par</th>
          <th>Bogey</th>
          <th>Double bogey</th>
          <th>Ball in water</th>
          <th>Out of bounds</th>
          <th>Missed GIR</th>
          <th>Three putt</th>
          <th>Bunker</th>
          <th>Sand save</th>
          <th>Points</th>
        </thead>
        <tbody>
          {rounds.map(round => {
            return (
              <tr key={round.id}>
                <td>Round {round.id}</td>
                <td>{round.stats.hio}</td>
                <td>{round.stats.doubleEagle}</td>
                <td>{round.stats.eagle}</td>
                <td>{round.stats.birdie}</td>
                <td>{round.stats.par}</td>
                <td>{round.stats.bogey}</td>
                <td>{round.stats.doubleBogey}</td>
                <td>{round.stats.ballInWater}</td>
                <td>{round.stats.outOfBounds}</td>
                <td>{round.stats.missedGir}</td>
                <td>{round.stats.threePutt}</td>
                <td>{round.stats.bunker}</td>
                <td>{round.stats.sandSave}</td>
                <td>{calculatePoints(round)}</td>
              </tr>
            );
          })}
        </tbody>
      </StatsTable>
    </div>
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
