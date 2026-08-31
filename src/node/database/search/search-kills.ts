import { killRowToKill } from '../kills/kill-row-to-kill';
import type { KillRow } from '../kills/kill-table';
import type { KillResult } from 'csdm/common/types/search/kill-result';
import type { SearchFilter } from 'csdm/common/types/search/search-filter';
import type { SearchEvent } from 'csdm/common/types/search/search-event';
import { TriStateFilter } from 'csdm/common/types/tri-state-filter';
import { WeaponType } from 'csdm/common/types/counter-strike';
import { lastArrayItem } from 'csdm/common/array/last-array-item';
import { getStore } from 'csdm/node/store/store';
import { readMatchEvents } from 'csdm/node/store/match-io';

export type SearchKillsFilter = SearchFilter & {
  event: typeof SearchEvent.Kills;
  headshot: TriStateFilter;
  noScope: TriStateFilter;
  wallbang: TriStateFilter;
  jump: TriStateFilter;
  throughSmoke: TriStateFilter;
  teamKill: TriStateFilter;
  collateralKill: TriStateFilter;
};

const excludedCollateralWeaponTypes = new Set<WeaponType>([
  WeaponType.Equipment,
  WeaponType.Grenade,
  WeaponType.Unknown,
  WeaponType.World,
]);

export async function searchKills({
  headshot,
  noScope,
  wallbang,
  jump,
  throughSmoke,
  teamKill,
  collateralKill,
  steamIds,
  victimSteamIds,
  mapNames,
  startDate,
  endDate,
  demoSources,
  roundTagIds,
  matchTagIds,
  weaponNames,
}: SearchKillsFilter) {
  const { matchIndex, catalogs } = getStore();
  const steamIdSet = steamIds.length > 0 ? new Set(steamIds) : undefined;
  const victimSteamIdSet = victimSteamIds.length > 0 ? new Set(victimSteamIds) : undefined;
  const mapNameSet = mapNames.length > 0 ? new Set(mapNames) : undefined;
  const sourceSet = demoSources.length > 0 ? new Set(demoSources) : undefined;
  const weaponNameSet = weaponNames.length > 0 ? new Set(weaponNames) : undefined;
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

  const result: KillResult[] = [];
  for (const match of matches) {
    const kills = await readMatchEvents<KillRow>(match.checksum, 'kills');
    const collateralCounts = new Map<string, number>();
    for (const kill of kills) {
      if (excludedCollateralWeaponTypes.has(kill.weapon_type)) {
        continue;
      }
      const key = `${kill.tick}:${kill.killer_steam_id}`;
      collateralCounts.set(key, (collateralCounts.get(key) ?? 0) + 1);
    }

    const filtered = kills
      .filter((kill) => {
        if (weaponNameSet && !weaponNameSet.has(kill.weapon_name)) {
          return false;
        }
        if (headshot !== TriStateFilter.All && kill.is_headshot !== (headshot === TriStateFilter.Yes)) {
          return false;
        }
        if (noScope !== TriStateFilter.All && kill.is_no_scope !== (noScope === TriStateFilter.Yes)) {
          return false;
        }
        if (wallbang !== TriStateFilter.All) {
          const isWallbang = kill.penetrated_objects > 0;
          if (isWallbang !== (wallbang === TriStateFilter.Yes)) {
            return false;
          }
        }
        if (jump !== TriStateFilter.All && kill.is_killer_airborne !== (jump === TriStateFilter.Yes)) {
          return false;
        }
        if (throughSmoke !== TriStateFilter.All && kill.is_through_smoke !== (throughSmoke === TriStateFilter.Yes)) {
          return false;
        }
        if (teamKill !== TriStateFilter.All) {
          const isTeamKill = kill.killer_side === kill.victim_side && kill.killer_steam_id !== kill.victim_steam_id;
          if (teamKill === TriStateFilter.Yes) {
            if (!isTeamKill) {
              return false;
            }
          } else if (kill.killer_side === kill.victim_side) {
            return false;
          }
        }
        if (collateralKill !== TriStateFilter.All) {
          const count = collateralCounts.get(`${kill.tick}:${kill.killer_steam_id}`) ?? 0;
          const isCollateral = count > 1 && !excludedCollateralWeaponTypes.has(kill.weapon_type);
          if (isCollateral !== (collateralKill === TriStateFilter.Yes)) {
            return false;
          }
        }
        if (steamIdSet && !steamIdSet.has(kill.killer_steam_id)) {
          return false;
        }
        if (victimSteamIdSet && !victimSteamIdSet.has(kill.victim_steam_id)) {
          return false;
        }
        if (roundTagSet) {
          const hasTag = catalogs.roundTags.some(
            (tag) =>
              tag.checksum === match.checksum &&
              tag.round_number === kill.round_number &&
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
          left.round_number - right.round_number ||
          left.tick - right.tick ||
          left.killer_name.localeCompare(right.killer_name),
      );

    let currentTick = 0;
    let currentChecksum = '';
    for (const row of filtered) {
      const comment =
        catalogs.roundComments.find(
          (item) => item.match_checksum === match.checksum && item.number === row.round_number,
        )?.comment ?? '';
      if (row.tick !== currentTick || row.match_checksum !== currentChecksum) {
        currentTick = row.tick;
        currentChecksum = row.match_checksum;
        result.push({
          matchChecksum: row.match_checksum,
          demoPath: match.demoPath,
          game: match.game,
          id: String(row.id),
          killerName: row.killer_name,
          killerSteamId: row.killer_steam_id,
          roundNumber: row.round_number,
          tick: row.tick,
          date: new Date(match.date).toISOString(),
          mapName: match.mapName,
          side: row.killer_side,
          kills: [killRowToKill(row)],
          roundComment: comment,
        });
      } else if (result.length > 0) {
        lastArrayItem(result).kills.push(killRowToKill(row));
      }
    }
  }

  return result;
}
