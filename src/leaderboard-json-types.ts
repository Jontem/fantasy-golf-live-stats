export interface LeaderBoardResponse {
  readonly leaderboard: LeaderBoard;
}

export interface LeaderBoard {
  readonly courses: ReadonlyArray<Course>;
  readonly players: ReadonlyArray<LeaderBoardPlayer>;
  readonly start_date: string;
  readonly end_date: string;
  readonly is_started: boolean;
  readonly is_finnished: boolean;
}

export interface Course {
  readonly holes: ReadonlyArray<Hole>;
}

export interface Hole {
  readonly hole_id: number;
  readonly round: ReadonlyArray<Round>;
}

export interface Round {
  readonly round_num: string;
  readonly par: number;
}

export interface LeaderBoardPlayer {
  readonly player_id: string;
  readonly player_bio: LeaderBoardPlayerBio;
}

export interface LeaderBoardPlayerBio {
  readonly first_name: string;
  readonly last_name: string;
}
