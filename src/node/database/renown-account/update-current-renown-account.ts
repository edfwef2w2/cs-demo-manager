import { updateCatalog } from 'csdm/node/store/store';

export async function updateCurrentRenownAccount(steamId: string) {
  await updateCatalog('renownAccounts', (current) => {
    return current.map((row) => {
      return {
        ...row,
        is_current: row.steam_id === steamId,
      };
    });
  });
}
