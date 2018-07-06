import * as React from "react";
import {
  PlayerAggregate,
  Hole,
  getPlayerAggregates
} from "./stats-aggregation";
import { getShotPoints, calculatePoints } from "./calculate-points";
import { StatsTable, Points } from "./elements";
import { ValueRow } from "./value-row";
import { LeaderboardPlayer } from "./leaderboard-json-types";

interface PlayerAggregateProps {
  readonly holes: ReadonlyArray<Hole>;
  readonly playerId: string;
  readonly leaderboardPlayer: LeaderboardPlayer;
}
interface State {
  readonly expanded: boolean;
  readonly playerAggregate: PlayerAggregate | undefined;
}

const getPlayerScorecardUrl = (playerId: string) =>
  `https://statdata.pgatour.com/r/490/2018/scorecards/${playerId}.json`;

export class PlayerInfo extends React.Component<PlayerAggregateProps, State> {
  constructor(props: PlayerAggregateProps) {
    super(props);
    this.state = {
      expanded: false,
      playerAggregate: undefined
    };
  }

  async componentDidMount() {
    const r = await fetch(getPlayerScorecardUrl(this.props.playerId)).then(
      res => res.json()
    );

    console.log(r);
    const playerAggregate = getPlayerAggregates(this.props.holes, r);
    this.setState(state => ({
      playerAggregate
    }));
  }

  render(): JSX.Element {
    const { holes, leaderboardPlayer } = this.props;
    const { playerAggregate } = this.state;

    if (playerAggregate === undefined) {
      return (
        <div>
          <h2>Loading</h2>
        </div>
      );
    }

    const { rounds } = playerAggregate;

    const playerName = `${leaderboardPlayer.player_bio.first_name} ${
      leaderboardPlayer.player_bio.last_name
    }`;

    const setState = this.setState.bind(this);
    return (
      <div>
        <h2
          onClick={() => {
            setState((state: State) => ({
              expanded: !state.expanded
            }));
          }}
        >{`${this.state.expanded ? "-" : "+"} ${playerName}`}</h2>
        {this.state.expanded && (
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
              <th>Fairway hit</th>
              <th>Missed putt {"<"} 5 feet</th>
              <th>Putt 15-25 feet</th>
              <th>Putt > 25 feet</th>
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
                      )}{" "}
                      <Points>({getShotPoints(round)})</Points>
                    </td>
                    <ValueRow stats={round.stats} statKey="hio" />
                    <ValueRow stats={round.stats} statKey="doubleEagle" />
                    <ValueRow stats={round.stats} statKey="eagle" />
                    <ValueRow stats={round.stats} statKey="birdie" />
                    <ValueRow stats={round.stats} statKey="par" />
                    <ValueRow stats={round.stats} statKey="bogey" />
                    <ValueRow stats={round.stats} statKey="doubleBogey" />
                    <ValueRow stats={round.stats} statKey="ballInWater" />
                    <ValueRow stats={round.stats} statKey="outOfBounds" />
                    <ValueRow stats={round.stats} statKey="missedGir" />
                    <ValueRow stats={round.stats} statKey="threePutt" />
                    <ValueRow stats={round.stats} statKey="bunker" />
                    <ValueRow stats={round.stats} statKey="sandSave" />
                    <ValueRow stats={round.stats} statKey="fairwayHits" />
                    <ValueRow stats={round.stats} statKey="missedPutt5Feet" />
                    <ValueRow stats={round.stats} statKey="putt15To25Feet" />
                    <ValueRow stats={round.stats} statKey="putt25Feet" />
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
                    (soFar, current) => soFar + current.stats.fairwayHits.value,
                    0
                  )}
                </td>
                <td>
                  {rounds.reduce(
                    (soFar, current) =>
                      soFar + current.stats.missedPutt5Feet.value,
                    0
                  )}
                </td>
                <td>
                  {rounds.reduce(
                    (soFar, current) =>
                      soFar + current.stats.putt15To25Feet.value,
                    0
                  )}
                </td>
                <td>
                  {rounds.reduce(
                    (soFar, current) => soFar + current.stats.putt25Feet.value,
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
        )}
      </div>
    );
  }
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
