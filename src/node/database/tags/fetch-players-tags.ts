import { getStore } from 'csdm/node/store/store';

export async function fetchPlayersTags() {
  await Promise.resolve();
  return getStore().catalogs.steamAccountTags;
}
