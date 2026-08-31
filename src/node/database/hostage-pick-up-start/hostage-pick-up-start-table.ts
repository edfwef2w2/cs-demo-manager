import type { ColumnID } from 'csdm/common/types/column-id';

export type HostagePickUpStartTable = {
  id: ColumnID;
  match_checksum: string;
  round_number: number;
  tick: number;
  frame: number;
  player_steam_id: string;
  is_player_controlling_bot: boolean;
  hostage_entity_id: number;
  x: number;
  y: number;
  z: number;
};

export type HostagePickUpStartRow = HostagePickUpStartTable;
