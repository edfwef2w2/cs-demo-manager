import { getStore } from 'csdm/node/store/store';

export async function fetchPlayersTags() {
  return getStore().catalogs.steamAccountTags;
}
