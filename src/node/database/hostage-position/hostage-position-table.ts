import type { HostageState } from 'csdm/common/types/counter-strike';
import type { ColumnID } from 'csdm/common/types/column-id';

export type HostagePositionTable = {
  id: ColumnID;
  match_checksum: string;
  round_number: number;
  tick: number;
  frame: number;
  state: HostageState;
  x: number;
  y: number;
  z: number;
};

export type HostagePositionRow = HostagePositionTable;
