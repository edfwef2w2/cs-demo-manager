import type { Game, Rank } from 'csdm/common/types/counter-strike';
import { getStore } from 'csdm/node/store/store';
import { getOverriddenSteamName } from 'csdm/node/store/steam-name';

export type LastPlayersData = {
  steamId: string;
  rank: Rank;
  game: Game;
  name: string;
  winsCount: number;
  lastKnownName: string | null;
  avatar: string | null;
  lastBanDate: Date | null;
  lastMatchDate: Date;
  vacBanCount: number | null;
  gameBanCount: number | null;
  isCommunityBanned: boolean | null;
};

export async function fetchLastPlayersData(steamIds: string[]): Promise<LastPlayersData[]> {
  if (steamIds.length === 0) {
    return [];
  }

  const steamIdSet = new Set(steamIds);
  const { playerMatchIndex, catalogs } = getStore();
  const lastBySteamId = new Map<string, LastPlayersData>();

  const rows = playerMatchIndex
    .filter((row) => steamIdSet.has(row.steamId))
    .toSorted((left, right) => right.date.localeCompare(left.date));

  for (const row of rows) {
    if (lastBySteamId.has(row.steamId)) {
      continue;
    }
    const account = catalogs.steamAccounts.find((item) => item.steam_id === row.steamId);
    lastBySteamId.set(row.steamId, {
      steamId: row.steamId,
      rank: row.rank,
      game: row.game,
      name: row.name,
      winsCount: row.winsCount,
      lastKnownName: getOverriddenSteamName(row.steamId, account?.name ?? row.name),
      avatar: account?.avatar ?? null,
      lastBanDate: account?.last_ban_date ?? null,
      lastMatchDate: new Date(row.date),
      vacBanCount: account?.vac_ban_count ?? null,
      gameBanCount: account?.game_ban_count ?? null,
      isCommunityBanned: account?.is_community_banned ?? null,
    });
  }

  return [...lastBySteamId.values()];
}
