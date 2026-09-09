import { getStore } from 'csdm/node/store/store';
import { mapRowToMap } from './map-row-to-map';

export function fetchMaps() {
  const rows = getStore().catalogs.maps.toSorted((left, right) => left.name.localeCompare(right.name));
  return Promise.all(rows.map(mapRowToMap));
}
