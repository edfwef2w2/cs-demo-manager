import { getStore } from './store';

export function getOverriddenSteamName(steamId: string, fallback: string | null | undefined) {
  const override = getStore().catalogs.steamAccountOverrides.find((row) => row.steam_id === steamId);
  return override?.name ?? fallback ?? '';
}

export function getBannedPlayerCount(dateIso: string, steamIds: string[]) {
  const { catalogs } = getStore();
  const ignored = new Set(catalogs.ignoredSteamAccounts.map((row) => row.steam_id));
  const matchDate = new Date(dateIso).getTime();
  let count = 0;
  for (const steamId of steamIds) {
    if (ignored.has(steamId)) {
      continue;
    }
    const account = catalogs.steamAccounts.find((row) => row.steam_id === steamId);
    if (account?.last_ban_date && account.last_ban_date.getTime() >= matchDate) {
      count += 1;
    }
  }

  return count;
}
