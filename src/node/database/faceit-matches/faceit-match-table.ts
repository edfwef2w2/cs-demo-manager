import type { Game } from 'csdm/common/types/counter-strike';

export type FaceitMatchTable = {
  id: string;
  game: Game;
  map_name: string;
  date: Date;
  duration_in_seconds: number;
  demo_url: string;
  url: string;
  game_mode: string;
  winner_id: string;
  winner_name: string;
};

export type FaceitMatchRow = FaceitMatchTable;
