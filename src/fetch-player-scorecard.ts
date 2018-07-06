import { PlayerScorecardResponse } from "./player-scorecard-types";

const getPlayerScorecardUrl = (playerId: string) =>
  `https://statdata.pgatour.com/r/490/2018/scorecards/${playerId}.json`;

const localStorageKey = "responseStore";

interface FetchPlayerData {
  response: PlayerScorecardResponse;
  date: number;
}

interface ResponseStore {
  readonly [key: string]: FetchPlayerData;
}

export async function fetchPlayerScorecard(
  playerId: string
): Promise<FetchPlayerData> {
  const responseStore: ResponseStore = JSON.parse(
    localStorage.getItem(localStorageKey) || "{}"
  );
  const fetchPlayerDataCache = responseStore[playerId];
  if (
    fetchPlayerDataCache &&
    Math.round((Date.now() - fetchPlayerDataCache.date) / 1000) < 30
  ) {
    return fetchPlayerDataCache;
  }

  const r = await fetch(getPlayerScorecardUrl(playerId)).then(res =>
    res.json()
  );

  const fetchPlayerData: FetchPlayerData = {
    response: r,
    date: Date.now()
  };

  localStorage.setItem(
    localStorageKey,
    JSON.stringify({ ...responseStore, [playerId]: fetchPlayerData })
  );

  return fetchPlayerData;
}
