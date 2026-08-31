import { MapAlreadyExists } from './errors/map-already-exists';
import type { InsertableMap, MapRow } from './map-table';
import { nextNumericId } from 'csdm/node/store/next-id';
import { updateCatalog } from 'csdm/node/store/store';

export async function insertMaps(maps: InsertableMap[]) {
  const inserted: MapRow[] = [];

  await updateCatalog('maps', (current) => {
    const next = [...current];
    let nextId = nextNumericId(next);
    for (const map of maps) {
      if (next.some((row) => row.name === map.name && row.game === map.game)) {
        throw new MapAlreadyExists();
      }
      const row: MapRow = {
        id: map.id ?? nextId,
        name: map.name,
        game: map.game,
        position_x: map.position_x,
        position_y: map.position_y,
        threshold_z: map.threshold_z,
        scale: map.scale,
      };
      nextId += 1;
      next.push(row);
      inserted.push(row);
    }
    return next;
  });

  return inserted;
}
