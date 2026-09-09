import type { PlayerResult } from 'csdm/common/types/search/player-result';
import type { PlayersFilter } from 'csdm/common/types/search/players-filter';
import { getStore } from 'csdm/node/store/store';

export function searchPlayers({ steamIdOrName, ignoredSteamIds }: PlayersFilter) {
  const needle = steamIdOrName.toLowerCase();
  const ignored = new Set(ignoredSteamIds);
  const players = new Map<string, PlayerResult>();

  for (const row of getStore().playerMatchIndex) {
    if (ignored.has(row.steamId) || players.has(row.steamId)) {
      continue;
    }
    if (row.steamId === steamIdOrName || row.name.toLowerCase().includes(needle)) {
      players.set(row.steamId, { name: row.name, steamId: row.steamId });
    }
    if (players.size >= 20) {
      break;
    }
  }

  return [...players.values()];
}
