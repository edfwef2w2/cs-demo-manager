import { getStore } from 'csdm/node/store/store';

export async function fetchSteamAccounts(steamIds: string[]) {
  await Promise.resolve();
  const steamIdSet = new Set(steamIds);
  return getStore().catalogs.steamAccounts.filter((row) => steamIdSet.has(row.steam_id));
}
