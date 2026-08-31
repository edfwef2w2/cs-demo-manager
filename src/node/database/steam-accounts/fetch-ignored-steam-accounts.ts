import type { IgnoredSteamAccount } from '../../../common/types/ignored-steam-account';
import { getStore } from 'csdm/node/store/store';

export async function fetchIgnoredSteamAccounts(steamIds?: string[]): Promise<IgnoredSteamAccount[]> {
  const { catalogs } = getStore();
  const steamIdSet = Array.isArray(steamIds) && steamIds.length > 0 ? new Set(steamIds) : undefined;

  const ignoredAccounts: IgnoredSteamAccount[] = [];
  for (const ignored of catalogs.ignoredSteamAccounts) {
    if (steamIdSet && !steamIdSet.has(ignored.steam_id)) {
      continue;
    }
    const account = catalogs.steamAccounts.find((row) => row.steam_id === ignored.steam_id);
    if (!account) {
      continue;
    }
    ignoredAccounts.push({
      steamId: ignored.steam_id,
      name: account.name,
      avatar: account.avatar,
      lastBanDate: account.last_ban_date?.toISOString() ?? null,
    });
  }

  return ignoredAccounts;
}
