import { isBlankString } from 'csdm/common/string/is-empty-string';
import { getStore, updateCatalog } from 'csdm/node/store/store';
import { SteamAccountNameTooLong } from './errors/steam-account-name-too-long';

export async function updateSteamAccountName(steamId: string, name: string) {
  const shouldDeleteOverride = isBlankString(name);
  if (shouldDeleteOverride) {
    await updateCatalog('steamAccountOverrides', (current) => current.filter((row) => row.steam_id !== steamId));
    const defaultNameRow = getStore().catalogs.steamAccounts.find((row) => row.steam_id === steamId);
    return defaultNameRow?.name ?? name;
  }

  if (name.length > 32) {
    throw new SteamAccountNameTooLong();
  }

  await updateCatalog('steamAccountOverrides', (current) => {
    const next = current.filter((row) => row.steam_id !== steamId);
    next.push({ steam_id: steamId, name });
    return next;
  });

  return name;
}
