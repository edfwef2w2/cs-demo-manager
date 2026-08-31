import type { EconomyType, TeamNumber } from 'csdm/common/types/counter-strike';
import type { ColumnID } from 'csdm/common/types/column-id';

export type PlayerEconomyTable = {
  id: ColumnID;
  match_checksum: string;
  round_number: number;
  player_steam_id: string;
  player_name: string;
  player_side: TeamNumber;
  start_money: number;
  money_spent: number;
  equipment_value: number;
  type: EconomyType;
};

export type PlayerEconomyRow = PlayerEconomyTable;
