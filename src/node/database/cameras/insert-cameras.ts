import type { CameraRow, InsertableCamera } from './cameras-table';
import { CameraAlreadyExists } from './errors/camera-already-exists';
import { randomUUID } from 'node:crypto';
import { updateCatalog } from 'csdm/node/store/store';

export async function insertCamera(camera: InsertableCamera) {
  const inserted = await updateCatalog('cameras', (current) => {
    if (current.some((row) => row.name === camera.name && row.game === camera.game && row.map_name === camera.map_name)) {
      throw new CameraAlreadyExists();
    }

    const row: CameraRow = {
      id: camera.id ?? randomUUID(),
      name: camera.name,
      game: camera.game,
      map_name: camera.map_name,
      x: camera.x,
      y: camera.y,
      z: camera.z,
      yaw: camera.yaw,
      pitch: camera.pitch,
      color: camera.color,
      comment: camera.comment,
    };

    return [...current, row];
  });

  const row = inserted[inserted.length - 1];
  if (row === undefined) {
    throw new Error('Failed to insert camera');
  }

  return row;
}
