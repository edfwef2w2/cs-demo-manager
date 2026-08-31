import { getStore } from 'csdm/node/store/store';
import { tagRowToTag } from './tag-row-to-tag';

export async function fetchTags() {
  const { catalogs } = getStore();
  return catalogs.tags
    .slice()
    .sort((left, right) => left.name.localeCompare(right.name))
    .map(tagRowToTag);
}
