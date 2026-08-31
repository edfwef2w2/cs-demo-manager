import { readMatchEvents } from 'csdm/node/store/match-io';
import { getStore } from 'csdm/node/store/store';
import type { KillRow } from '../kills/kill-table';

type PlayerWeaponInspectionsStats = {
  steamId: string;
  deathWhileInspectingWeaponCount: number;
};

export async function fetchPlayersWeaponInspectionsStats(
  checksums: string[],
  steamIds: string[],
): Promise<PlayerWeaponInspectionsStats[]> {
  const targetChecksums = checksums.length > 0 ? checksums : getStore().matchIndex.map((row) => row.checksum);
  const steamIdSet = steamIds.length > 0 ? new Set(steamIds) : undefined;
  const counts = new Map<string, number>();

  for (const checksum of targetChecksums) {
    const kills = await readMatchEvents<KillRow>(checksum, 'kills');
    for (const kill of kills) {
      if (!kill.is_victim_inspecting_weapon) {
        continue;
      }
      if (steamIdSet && !steamIdSet.has(kill.victim_steam_id)) {
        continue;
      }
      counts.set(kill.victim_steam_id, (counts.get(kill.victim_steam_id) ?? 0) + 1);
    }
  }

  return [...counts.entries()].map(([steamId, deathWhileInspectingWeaponCount]) => ({
    steamId,
    deathWhileInspectingWeaponCount,
  }));
}
