import { getStore } from 'csdm/node/store/store';

export function fetchPlayersTags() {
  return getStore().catalogs.steamAccountTags;
}
