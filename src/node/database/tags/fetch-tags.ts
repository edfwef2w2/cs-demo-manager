import { getStore } from 'csdm/node/store/store';
import { tagRowToTag } from './tag-row-to-tag';

export async function fetchTags() {
  await Promise.resolve();
  const { catalogs } = getStore();
  return catalogs.tags.toSorted((left, right) => left.name.localeCompare(right.name)).map(tagRowToTag);
}
