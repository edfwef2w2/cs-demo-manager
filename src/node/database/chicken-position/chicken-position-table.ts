import type { ColumnID } from 'csdm/common/types/column-id';

export type ChickenPositionTable = {
  id: ColumnID;
  match_checksum: string;
  round_number: number;
  tick: number;
  frame: number;
  x: number;
  y: number;
  z: number;
};

export type ChickenPositionRow = ChickenPositionTable;
