import { readMatchEvents } from 'csdm/node/store/match-io';
import { getStore } from 'csdm/node/store/store';
import type { PlayerBlindTable } from '../player-blinds/player-blind-table';

type Filters = {
  checksums?: string[];
  steamIds?: string[];
};

type PlayerEnemiesFlashedCount = {
  steamId: string;
  enemiesFlashedCount: number;
};

export async function fetchPlayersEnemiesFlashedCount(filters: Filters): Promise<PlayerEnemiesFlashedCount[]> {
  const checksums = filters.checksums ?? [];
  const targetChecksums = checksums.length > 0 ? checksums : getStore().matchIndex.map((row) => row.checksum);
  const steamIdSet = filters.steamIds && filters.steamIds.length > 0 ? new Set(filters.steamIds) : undefined;
  const counts = new Map<string, number>();

  for (const checksum of targetChecksums) {
    const blinds = await readMatchEvents<PlayerBlindTable>(checksum, 'blinds');
    for (const blind of blinds) {
      if (blind.flasher_side === blind.flashed_side || blind.is_flasher_controlling_bot) {
        continue;
      }
      if (steamIdSet && !steamIdSet.has(blind.flasher_steam_id)) {
        continue;
      }
      counts.set(blind.flasher_steam_id, (counts.get(blind.flasher_steam_id) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries(), ([steamId, enemiesFlashedCount]) => ({
    steamId,
    enemiesFlashedCount,
  }));
}
