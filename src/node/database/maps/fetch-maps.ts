import { getStore } from 'csdm/node/store/store';
import { mapRowToMap } from './map-row-to-map';

export async function fetchMaps() {
  await Promise.resolve();
  const rows = getStore().catalogs.maps.toSorted((left, right) => left.name.localeCompare(right.name));
  return Promise.all(rows.map(mapRowToMap));
}
