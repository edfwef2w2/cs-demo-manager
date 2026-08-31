import type { Game } from 'csdm/common/types/counter-strike';
import type { ColumnID } from 'csdm/common/types/column-id';

export type MapTable = {
  id: ColumnID;
  name: string;
  game: Game;
  position_x: number;
  position_y: number;
  threshold_z: number;
  scale: number;
};

export type MapRow = MapTable;
export type InsertableMap = Omit<MapTable, 'id'> & { id?: ColumnID };
export type UpdatableMap = MapTable;
