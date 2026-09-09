import { getStore } from 'csdm/node/store/store';

export async function fetchDownloadHistories() {
  await Promise.resolve();
  return getStore().catalogs.downloadHistory;
}
