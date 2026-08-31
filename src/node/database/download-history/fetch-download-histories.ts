import { getStore } from 'csdm/node/store/store';

export async function fetchDownloadHistories() {
  return getStore().catalogs.downloadHistory;
}
