import { updateCatalog } from 'csdm/node/store/store';

export async function insertOrUpdatePlayerComment(steamId: string, comment: string) {
  await updateCatalog('playerComments', (current) => {
    const next = current.filter((row) => row.steam_id !== steamId);
    next.push({ steam_id: steamId, comment });
    return next;
  });
}
