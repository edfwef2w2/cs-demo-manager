import { getStore } from 'csdm/node/store/store';

export async function fetchSteamAccounts(steamIds: string[]) {
  const steamIdSet = new Set(steamIds);
  return getStore().catalogs.steamAccounts.filter((row) => steamIdSet.has(row.steam_id));
}
