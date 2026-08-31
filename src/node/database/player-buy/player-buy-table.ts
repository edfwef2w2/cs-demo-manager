import type { TeamNumber, WeaponType, WeaponName } from 'csdm/common/types/counter-strike';
import type { ColumnID } from 'csdm/common/types/column-id';

export type PlayerBuyTable = {
  id: ColumnID;
  match_checksum: string;
  round_number: number;
  tick: number;
  frame: number;
  player_steam_id: string;
  player_name: string;
  player_side: TeamNumber;
  weapon_name: WeaponName;
  weapon_type: WeaponType;
  weapon_unique_id: string;
  has_refunded: boolean;
};
