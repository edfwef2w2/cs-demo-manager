import { killRowToKill } from '../kills/kill-row-to-kill';
import type { KillRow } from '../kills/kill-table';
import type { MultiKillResult } from 'csdm/common/types/search/multi-kill-result';
import type { SearchFilter } from 'csdm/common/types/search/search-filter';
import { getStore } from 'csdm/node/store/store';
import { readMatchEvents } from 'csdm/node/store/match-io';

type Filter = SearchFilter & {
  killCount: number;
};

export async function searchMultiKills({
  killCount,
  steamIds,
  victimSteamIds,
  weaponNames,
  mapNames,
  startDate,
  endDate,
  demoSources,
  roundTagIds,
  matchTagIds,
}: Filter) {
  const { matchIndex, catalogs } = getStore();
  const steamIdSet = steamIds.length > 0 ? new Set(steamIds) : undefined;
  const victimSteamIdSet = victimSteamIds.length > 0 ? new Set(victimSteamIds) : undefined;
  const weaponNameSet = weaponNames.length > 0 ? new Set(weaponNames) : undefined;
  const mapNameSet = mapNames.length > 0 ? new Set(mapNames) : undefined;
  const sourceSet = demoSources.length > 0 ? new Set(demoSources) : undefined;
  const matchTagSet = matchTagIds.length > 0 ? new Set(matchTagIds.map(String)) : undefined;
  const roundTagSet = roundTagIds.length > 0 ? new Set(roundTagIds.map(String)) : undefined;

  const matches = matchIndex
    .filter((row) => {
      if (mapNameSet && !mapNameSet.has(row.mapName)) {
        return false;
      }
      if (startDate && endDate && (row.date < startDate || row.date > endDate)) {
        return false;
      }
      if (sourceSet && !sourceSet.has(row.source)) {
        return false;
      }
      if (matchTagSet) {
        const hasTag = catalogs.checksumTags.some(
          (tag) => tag.checksum === row.checksum && matchTagSet.has(String(tag.tag_id)),
        );
        if (!hasTag) {
          return false;
        }
      }
      return true;
    })
    .slice()
    .sort((left, right) => right.date.localeCompare(left.date));

  const multiKills: MultiKillResult[] = [];
  for (const match of matches) {
    const kills = await readMatchEvents<KillRow>(match.checksum, 'kills');
    const grouped = new Map<string, KillRow[]>();
    for (const kill of kills) {
      if (steamIdSet && !steamIdSet.has(kill.killer_steam_id)) {
        continue;
      }
      const key = `${kill.round_number}:${kill.killer_steam_id}`;
      const current = grouped.get(key) ?? [];
      current.push(kill);
      grouped.set(key, current);
    }

    const qualifying = [...grouped.values()]
      .filter((group) => {
        if (group.length !== killCount) {
          return false;
        }
        if (victimSteamIdSet && !group.some((kill) => victimSteamIdSet.has(kill.victim_steam_id))) {
          return false;
        }
        if (weaponNameSet && !group.some((kill) => weaponNameSet.has(kill.weapon_name))) {
          return false;
        }
        if (roundTagSet) {
          const hasTag = catalogs.roundTags.some(
            (tag) =>
              tag.checksum === match.checksum &&
              tag.round_number === group[0].round_number &&
              roundTagSet.has(String(tag.tag_id)),
          );
          if (!hasTag) {
            return false;
          }
        }
        return true;
      })
      .sort(
        (left, right) =>
          left[0].killer_name.localeCompare(right[0].killer_name) ||
          left[0].round_number - right[0].round_number ||
          left[0].tick - right[0].tick,
      );

    for (const group of qualifying) {
      const sorted = group.slice().sort((left, right) => left.tick - right.tick);
      const first = sorted[0];
      const comment =
        catalogs.roundComments.find(
          (item) => item.match_checksum === match.checksum && item.number === first.round_number,
        )?.comment ?? '';

      multiKills.push({
        matchChecksum: first.match_checksum,
        matchTickrate: match.tickrate,
        demoPath: match.demoPath,
        game: match.game,
        id: String(first.id),
        killerName: first.killer_name,
        killerSteamId: first.killer_steam_id,
        roundNumber: first.round_number,
        tick: first.tick,
        date: new Date(match.date).toISOString(),
        mapName: match.mapName,
        side: first.killer_side,
        kills: sorted.map(killRowToKill),
        roundComment: comment,
      });
    }
  }

  return multiKills;
}
