import { getStore } from 'csdm/node/store/store';

export function fetchDownloadHistories() {
  return getStore().catalogs.downloadHistory;
}
