import { getStore } from 'csdm/node/store/store';
import { buildSteamAccountsFromSteamIds } from './build-steam-accounts-from-steam-ids';
import { insertSteamAccounts } from './insert-steam-accounts';

export async function syncSteamAccountsWithPlayers(): Promise<string[]> {
  const { catalogs, playerMatchIndex } = getStore();
  const knownSteamIds = new Set(catalogs.steamAccounts.map((row) => row.steam_id));
  const missingSteamIds = [
    ...new Set(playerMatchIndex.map((row) => row.steamId).filter((steamId) => !knownSteamIds.has(steamId))),
  ];

  if (missingSteamIds.length === 0) {
    return [];
  }

  const steamAccounts = await buildSteamAccountsFromSteamIds(missingSteamIds);
  if (steamAccounts.length === 0) {
    return [];
  }

  await insertSteamAccounts(steamAccounts);
  return steamAccounts.map((account) => account.steam_id);
}
