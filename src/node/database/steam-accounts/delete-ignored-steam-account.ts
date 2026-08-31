import { updateCatalog } from 'csdm/node/store/store';

export async function deleteIgnoredSteamAccount(steamId: string) {
  await updateCatalog('ignoredSteamAccounts', (current) => current.filter((row) => row.steam_id !== steamId));
}
