import type { Game } from 'csdm/common/types/counter-strike';
import { getDefaultMaps } from 'csdm/node/database/maps/default-maps';
import { deleteMapImageFiles } from 'csdm/node/filesystem/maps/delete-map-image-files';
import { nextNumericId } from 'csdm/node/store/next-id';
import { updateCatalog } from 'csdm/node/store/store';

export async function resetDefaultMaps(game: Game) {
  const defaultMaps = getDefaultMaps(game);

  await updateCatalog('maps', (current) => {
    const next = [...current];
    let nextId = nextNumericId(next);
    for (const map of defaultMaps) {
      const existingIndex = next.findIndex((row) => row.name === map.name && row.game === map.game);
      if (existingIndex >= 0) {
        next[existingIndex] = {
          ...next[existingIndex],
          position_x: map.position_x,
          position_y: map.position_y,
          scale: map.scale,
          name: map.name,
        };
      } else {
        next.push({
          id: nextId,
          name: map.name,
          game: map.game,
          position_x: map.position_x,
          position_y: map.position_y,
          threshold_z: map.threshold_z,
          scale: map.scale,
        });
        nextId += 1;
      }
    }
    return next;
  });

  for (const map of defaultMaps) {
    await deleteMapImageFiles(map);
  }
}
