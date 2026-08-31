import { updateCatalog } from 'csdm/node/store/store';

export async function deleteOldDownloadHistories() {
  const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  await updateCatalog('downloadHistory', (current) => {
    return current.filter((row) => row.downloaded_at.getTime() >= oneMonthAgo);
  });
}
