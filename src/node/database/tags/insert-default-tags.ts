import { getDefaultTags } from 'csdm/node/store/seed';
import { getStore } from 'csdm/node/store/store';

export async function insertDefaultTags() {
  const { catalogs } = getStore();
  if (catalogs.tags.length === 0) {
    catalogs.tags = getDefaultTags();
  }
}
