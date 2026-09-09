import type { BannedSteamAccount } from 'csdm/common/types/banned-steam-account';
import { getStore } from 'csdm/node/store/store';

export async function fetchBannedSteamAccounts(ignoreBanBeforeFirstSeen: boolean) {
  const { catalogs, playerMatchIndex } = getStore();
  const ignored = new Set(catalogs.ignoredSteamAccounts.map((row) => row.steam_id));
  const lastMatchBySteamId = new Map<string, (typeof playerMatchIndex)[number]>();
  const firstMatchDateBySteamId = new Map<string, string>();

  for (const row of playerMatchIndex) {
    const last = lastMatchBySteamId.get(row.steamId);
    if (!last || row.date > last.date) {
      lastMatchBySteamId.set(row.steamId, row);
    }
    const firstDate = firstMatchDateBySteamId.get(row.steamId);
    if (!firstDate || row.date < firstDate) {
      firstMatchDateBySteamId.set(row.steamId, row.date);
    }
  }

  const bannedAccounts: BannedSteamAccount[] = catalogs.steamAccounts
    .filter((account) => {
      if (!account.last_ban_date || ignored.has(account.steam_id)) {
        return false;
      }
      if (ignoreBanBeforeFirstSeen) {
        const firstMatchDate = firstMatchDateBySteamId.get(account.steam_id);
        if (!firstMatchDate) {
          return false;
        }
        return account.last_ban_date.toISOString() >= firstMatchDate;
      }
      return true;
    })
    .toSorted((left, right) => {
      const leftDate = left.last_ban_date?.toISOString() ?? '';
      const rightDate = right.last_ban_date?.toISOString() ?? '';
      return rightDate.localeCompare(leftDate) || left.steam_id.localeCompare(right.steam_id);
    })
    .map((account) => {
      return {
        steamId: account.steam_id,
        name: account.name,
        avatar: account.avatar,
        lastBanDate: account.last_ban_date?.toISOString() ?? '',
        rank: lastMatchBySteamId.get(account.steam_id)?.rank ?? 0,
      };
    });

  return bannedAccounts;
}
