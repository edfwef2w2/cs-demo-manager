import type { MapNamesFilter } from 'csdm/common/types/search/map-names-filter';
import { getStore } from 'csdm/node/store/store';

export async function searchMapNames({ name, ignoredNames }: MapNamesFilter) {
  const needle = name.toLowerCase();
  const ignored = new Set(ignoredNames);
  const names = new Set<string>();
  for (const row of getStore().matchIndex) {
    if (ignored.has(row.mapName)) {
      continue;
    }
    if (!row.mapName.toLowerCase().includes(needle)) {
      continue;
    }
    names.add(row.mapName);
    if (names.size >= 20) {
      break;
    }
  }

  return [...names];
}
