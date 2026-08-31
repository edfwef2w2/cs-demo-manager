import type { UpdatableCamera } from './cameras-table';
import { updateCatalog } from 'csdm/node/store/store';

export async function updateCamera(camera: UpdatableCamera) {
  const cameras = await updateCatalog('cameras', (current) => {
    return current.map((row) => {
      if (String(row.id) !== String(camera.id)) {
        return row;
      }

      return {
        ...row,
        ...camera,
        id: row.id,
      };
    });
  });

  const updatedCamera = cameras.find((row) => String(row.id) === String(camera.id));
  if (updatedCamera === undefined) {
    throw new Error('Camera not found');
  }

  return updatedCamera;
}
