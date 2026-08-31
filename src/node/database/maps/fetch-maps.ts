import { getStore } from 'csdm/node/store/store';
import { mapRowToMap } from './map-row-to-map';

export async function fetchMaps() {
  const rows = getStore()
    .catalogs.maps.slice()
    .sort((left, right) => left.name.localeCompare(right.name));
  return Promise.all(rows.map(mapRowToMap));
}
