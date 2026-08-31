import { getStore } from 'csdm/node/store/store';
import { cameraRowToCamera } from './camera-row-to-camera';
import type { Game } from 'csdm/common/types/counter-strike';

export async function fetchCameras(game?: Game) {
  const rows = getStore()
    .catalogs.cameras.filter((row) => (game ? row.game === game : true))
    .slice()
    .sort((left, right) => left.name.localeCompare(right.name));

  return Promise.all(rows.map(cameraRowToCamera));
}
