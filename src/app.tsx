import * as React from "react";
import styled from "styled-components";
import { PlayerScorecardResponse } from "./player-scorecard-types";
import { LeaderBoardResponse } from "./leaderboard-json-types";
import {
  getPlayerAggregates,
  PlayerAggregate,
  PlayerAggregateRoundStat,
  Hole
} from "./stats-aggregation";
import { calculatePoints } from "./calculate-points";

const leaderboardUrl =
  "https://statdata.pgatour.com/r/471/2018/leaderboard-v2.json";

const getPlayerScorecardUrl = (playerId: string) =>
  `https://statdata.pgatour.com/r/471/2018/scorecards/${playerId}.json`;

const players = ["25198", "25632", "29420", "08793"];

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
  readonly holes: ReadonlyArray<Hole>;
}

function MyPlayers({ holes, playerAggregates }: MyPlayersProps) {
  return (
    <div>
      {playerAggregates.map(p => (
        <PlayerAggregate key={p.id} playerAggregate={p} holes={holes} />
      ))}
    </div>
  );
}

interface PlayerAggregateProps {
  readonly playerAggregate: PlayerAggregate;
  readonly holes: ReadonlyArray<Hole>;
}

function PlayerAggregate({
  holes,
  playerAggregate: { playerName, rounds }
}: PlayerAggregateProps): JSX.Element {
  return (
    <div>
      <h2>{playerName}</h2>
      <StatsTable>
        <thead>
          <th />
          <th>Hole / Par</th>
          <th>To Par</th>
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
                <td>{round.finnished ? round.shots : round.currentHole}</td>
                <td>
                  {getToPar(
                    holes,
                    round.shots,
                    round.currentHole,
                    round.finnished
                  )}
                </td>
                <ValueRow stat={round.stats.hio} />
                <ValueRow stat={round.stats.doubleEagle} />
                <ValueRow stat={round.stats.eagle} />
                <ValueRow stat={round.stats.birdie} />
                <ValueRow stat={round.stats.par} />
                <ValueRow stat={round.stats.bogey} />
                <ValueRow stat={round.stats.doubleBogey} />
                <ValueRow stat={round.stats.ballInWater} />
                <ValueRow stat={round.stats.outOfBounds} />
                <ValueRow stat={round.stats.missedGir} />
                <ValueRow stat={round.stats.threePutt} />
                <ValueRow stat={round.stats.bunker} />
                <ValueRow stat={round.stats.sandSave} />
                <td>{calculatePoints(round)}</td>
              </tr>
            );
          })}
          <tr>
            <td>Total</td>
            <td />
            <td>
              {rounds.reduce(
                (soFar, current) =>
                  soFar +
                  getToPar(
                    holes,
                    current.shots,
                    current.currentHole,
                    current.finnished
                  ),
                0
              )}
            </td>
            <td>
              {rounds.reduce(
                (soFar, current) => soFar + current.stats.hio.value,
                0
              )}
            </td>
            <td>
              {rounds.reduce(
                (soFar, current) => soFar + current.stats.doubleEagle.value,
                0
              )}
            </td>
            <td>
              {rounds.reduce(
                (soFar, current) => soFar + current.stats.eagle.value,
                0
              )}
            </td>
            <td>
              {rounds.reduce(
                (soFar, current) => soFar + current.stats.birdie.value,
                0
              )}
            </td>
            <td>
              {rounds.reduce(
                (soFar, current) => soFar + current.stats.par.value,
                0
              )}
            </td>
            <td>
              {rounds.reduce(
                (soFar, current) => soFar + current.stats.bogey.value,
                0
              )}
            </td>
            <td>
              {rounds.reduce(
                (soFar, current) => soFar + current.stats.doubleBogey.value,
                0
              )}
            </td>
            <td>
              {rounds.reduce(
                (soFar, current) => soFar + current.stats.ballInWater.value,
                0
              )}
            </td>
            <td>
              {rounds.reduce(
                (soFar, current) => soFar + current.stats.outOfBounds.value,
                0
              )}
            </td>
            <td>
              {rounds.reduce(
                (soFar, current) => soFar + current.stats.missedGir.value,
                0
              )}
            </td>
            <td>
              {rounds.reduce(
                (soFar, current) => soFar + current.stats.threePutt.value,
                0
              )}
            </td>
            <td>
              {rounds.reduce(
                (soFar, current) => soFar + current.stats.bunker.value,
                0
              )}
            </td>
            <td>
              {rounds.reduce(
                (soFar, current) => soFar + current.stats.sandSave.value,
                0
              )}
            </td>
            <td>
              {rounds.reduce(
                (soFar, current) => soFar + calculatePoints(current),
                0
              )}
            </td>
          </tr>
        </tbody>
      </StatsTable>
    </div>
  );
}
interface ValueRowProps {
  readonly stat: PlayerAggregateRoundStat;
}
function ValueRow({ stat: { value, holes } }: ValueRowProps): JSX.Element {
  return <td title={holes.join(", ")}>{value}</td>;
}

function getToPar(
  holes: ReadonlyArray<Hole>,
  shots: number,
  currentHole: number,
  finnished: boolean
): number {
  if (finnished) {
    const coursePar = holes.reduce((soFar, current) => soFar + current.par, 0);
    return shots - coursePar;
  }
  const lastCompletedHole = currentHole - 1;
  const currentPar = holes
    .slice(0, lastCompletedHole)
    .reduce((soFar, current) => soFar + current.par, 0);

  return shots - currentPar;
}
