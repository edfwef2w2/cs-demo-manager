import type { DemoRow } from 'csdm/node/database/demos/demo-table';
import type { MatchPlayerTable } from 'csdm/node/database/match-players/match-player-table';
import type { MatchRow } from 'csdm/node/database/matches/match-table';
import type { RoundTable } from 'csdm/node/database/rounds/round-table';
import type { TeamRow } from 'csdm/node/database/teams/team-table';

export type MatchDocument = {
  match: MatchRow;
  demo: DemoRow;
  teams: TeamRow[];
  players: MatchPlayerTable[];
  rounds: RoundTable[];
};

export const matchEventFiles = {
  kills: 'kills.json',
  damages: 'damages.json',
  shots: 'shots.json',
  clutches: 'clutches.json',
  blinds: 'blinds.json',
  economies: 'economies.json',
  buys: 'buys.json',
  chatMessages: 'chat-messages.json',
  grenadeBounces: 'grenade-bounces.json',
  grenadeProjectilesDestroy: 'grenade-projectiles-destroy.json',
  heGrenadesExplode: 'he-grenades-explode.json',
  smokesStart: 'smokes-start.json',
  decoysStart: 'decoys-start.json',
  flashbangsExplode: 'flashbangs-explode.json',
  bombs: 'bombs.json',
  hostages: 'hostages.json',
  chickenDeaths: 'chicken-deaths.json',
} as const;

export type MatchEventName = keyof typeof matchEventFiles;

export const positionCsvFiles = {
  players: 'players.csv',
  grenades: 'grenades.csv',
  infernos: 'infernos.csv',
  hostages: 'hostages.csv',
  chickens: 'chickens.csv',
} as const;

export type PositionCsvName = keyof typeof positionCsvFiles;

export type MatchBombsDocument = {
  planted: unknown[];
  defused: unknown[];
  exploded: unknown[];
  plantStart: unknown[];
  defuseStart: unknown[];
};

export type MatchHostagesDocument = {
  rescued: unknown[];
  pickUpStart: unknown[];
  pickedUp: unknown[];
};
