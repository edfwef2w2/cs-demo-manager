import { updateCatalog } from 'csdm/node/store/store';

export async function insertDownloadHistory(matchId: string) {
  await updateCatalog('downloadHistory', (current) => {
    const next = current.filter((row) => row.match_id !== matchId);
    next.push({
      match_id: matchId,
      downloaded_at: new Date(),
    });
    return next;
  });
}
