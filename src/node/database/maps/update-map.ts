import type { UpdatableMap } from './map-table';
import { updateCatalog } from 'csdm/node/store/store';

export async function updateMap(map: UpdatableMap) {
  if (!map.name) {
    throw new Error('Map name must be defined');
  }
  if (!map.game) {
    throw new Error('Map game must be defined');
  }
  if (!map.id) {
    throw new Error('Map ID must be defined');
  }

  const maps = await updateCatalog('maps', (current) => {
    return current.map((row) => {
      if (String(row.id) !== String(map.id)) {
        return row;
      }

      return {
        ...row,
        ...map,
        id: row.id,
      };
    });
  });

  return maps.filter((row) => String(row.id) === String(map.id));
}
