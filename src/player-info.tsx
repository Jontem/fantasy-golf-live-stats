import * as React from "react";
import {
  PlayerAggregate,
  Hole,
  getPlayerAggregates
} from "./stats-aggregation";
import { getShotPoints, calculatePoints } from "./calculate-points";
import { StatsTable, Points, PlayerHeader, DeletePlayer } from "./elements";
import { ValueRow } from "./value-row";
import { LeaderboardPlayer } from "./leaderboard-json-types";
import { getPlayerName } from "./utilities";
import { fetchPlayerScorecard } from "./fetch-player-scorecard";

interface PlayerInfoProps {
  readonly holes: ReadonlyArray<Hole>;
  readonly playerId: string;
  readonly leaderboardPlayer: LeaderboardPlayer;
  readonly onPlayerDeleted: () => void;
}
interface State {
  readonly expanded: boolean;
  readonly playerAggregate: PlayerAggregate | undefined;
  readonly lastFetched: number | undefined;
}

export class PlayerInfo extends React.Component<PlayerInfoProps, State> {
  constructor(props: PlayerInfoProps) {
    super(props);
    this.state = {
      expanded: false,
      playerAggregate: undefined,
      lastFetched: undefined
    };
  }

  async componentDidMount() {
    const { response, date } = await fetchPlayerScorecard(this.props.playerId);
    console.log(response);
    const playerAggregate = getPlayerAggregates(this.props.holes, response);
    this.setState(state => ({
      playerAggregate,
      lastFetched: date
    }));
  }

  render(): JSX.Element {
    const { holes, leaderboardPlayer, onPlayerDeleted } = this.props;
    const { playerAggregate, lastFetched } = this.state;

    const playerName = getPlayerName(leaderboardPlayer);

    if (playerAggregate === undefined || lastFetched === undefined) {
      return (
        <div>
          <h2>{playerName} - Loading</h2>
        </div>
      );
    }

    const { rounds } = playerAggregate;

    const setState = this.setState.bind(this);

    const fetchDate = new Date(lastFetched);
    return (
      <div>
        <PlayerHeader
          onClick={() => {
            setState((state: State) => ({
              expanded: !state.expanded
            }));
          }}
        >{`${
          this.state.expanded ? "-" : "+"
        } ${playerName}`}</PlayerHeader>{" "}
        <DeletePlayer
          onClick={e => {
            e.stopPropagation();
            onPlayerDeleted();
          }}
        >
          [X]
        </DeletePlayer>
        {this.state.expanded && (
          <>
            <p>{`${fetchDate.toLocaleDateString(
              "sv-SE"
            )} - ${fetchDate.toLocaleTimeString()}`}</p>
            <StatsTable>
              <thead>
                <th />
                <th>Hole / Par</th>
                <th>To Par</th>
                <th>Hio</th>
                <th>-3</th>
                <th>-2</th>
                <th>-1</th>
                <th>Par</th>
                <th>+1</th>
                <th>>=+2</th>
                <th>Water</th>
                <th>Out</th>
                <th>X GIR</th>
                <th>3 putt</th>
                <th>B</th>
                <th>SS</th>
                <th>FH</th>
                <th>MP {"<"} 5 feet</th>
                <th>P 15-25 feet</th>
                <th>P > 25 feet</th>
                <th>B-B</th>
                <th>P</th>
              </thead>
              <tbody>
                {rounds.map(round => {
                  return (
                    <tr key={round.id}>
                      <td>R{round.id}</td>
                      <td>
                        {round.finnished ? round.shots : round.currentHole}
                      </td>
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
                      <ValueRow
                        stats={round.stats}
                        statKey="consecutiveBirdie"
                      />
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
                      (soFar, current) =>
                        soFar + current.stats.doubleEagle.value,
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
                      (soFar, current) =>
                        soFar + current.stats.doubleBogey.value,
                      0
                    )}
                  </td>
                  <td>
                    {rounds.reduce(
                      (soFar, current) =>
                        soFar + current.stats.ballInWater.value,
                      0
                    )}
                  </td>
                  <td>
                    {rounds.reduce(
                      (soFar, current) =>
                        soFar + current.stats.outOfBounds.value,
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
                      (soFar, current) =>
                        soFar + current.stats.fairwayHits.value,
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
                      (soFar, current) =>
                        soFar + current.stats.putt25Feet.value,
                      0
                    )}
                  </td>
                  <td>
                    {rounds.reduce(
                      (soFar, current) =>
                        soFar + current.stats.consecutiveBirdie.value,
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
          </>
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
