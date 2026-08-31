import type { Game } from 'csdm/common/types/counter-strike';
import type { ColumnID } from 'csdm/common/types/column-id';

export type CamerasTable = {
  id: ColumnID;
  name: string;
  game: Game;
  map_name: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  color: string;
  comment: string;
};

export type CameraRow = CamerasTable;
export type InsertableCamera = Omit<CamerasTable, 'id'> & { id?: ColumnID };
export type UpdatableCamera = CamerasTable;
