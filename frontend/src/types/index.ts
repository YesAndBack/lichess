// User types
export interface UserRating {
  rating: number;
  games: number;
  prog: number;
  rd?: number;
  prov?: boolean;
}

export interface UserRatings {
  bullet?: UserRating;
  blitz?: UserRating;
  rapid?: UserRating;
  classical?: UserRating;
  correspondence?: UserRating;
  chess960?: UserRating;
  puzzle?: UserRating;
}

export interface UserProfile {
  country?: string;
  location?: string;
  bio?: string;
  firstName?: string;
  lastName?: string;
  links?: string;
}

export interface User {
  id: string;
  username: string;
  title?: string;
  patron: boolean;
  created_at_lichess?: string;
  seen_at?: string;
  play_time_total: number;
  play_time_tv: number;
  ratings: UserRatings;
  profile?: UserProfile;
}

// Game types
export type GameResult = 'win' | 'loss' | 'draw';

export interface Game {
  id: string;
  rated: boolean;
  variant: string;
  speed: string;
  perf_type: string;
  time_control_initial?: number;
  time_control_increment?: number;
  white_username: string;
  white_rating?: number;
  white_rating_diff?: number;
  black_username: string;
  black_rating?: number;
  black_rating_diff?: number;
  user_color: 'white' | 'black';
  result: GameResult;
  status: string;
  winner?: string;
  created_at: string;
  last_move_at?: string;
  opening_eco?: string;
  opening_name?: string;
  opponent_username?: string;
  opponent_rating?: number;
  lichess_url?: string;
}

export interface GameListResponse {
  games: Game[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface GameFilters {
  perf_type?: string;
  result?: GameResult;
  rated?: boolean;
}

export interface GameStats {
  total: number;
  results: {
    win: number;
    loss: number;
    draw: number;
  };
  by_type: Record<string, number>;
  win_rate: number;
}

// Auth types
export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  username: string;
}

export interface OAuthStartResponse {
  auth_url: string;
  state: string;
}
