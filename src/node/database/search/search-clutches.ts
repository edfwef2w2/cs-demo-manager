import { clutchRowToClutch } from '../clutches/clutch-row-to-clutch';
import type { ClutchRow } from '../clutches/clutch-table';
import type { SearchFilter } from 'csdm/common/types/search/search-filter';
import type { ClutchResult } from 'csdm/common/types/search/clutch-result';
import { getStore } from 'csdm/node/store/store';
import { readMatchEvents } from 'csdm/node/store/match-io';

type Filter = SearchFilter & {
  opponentCount: 1 | 2 | 3 | 4 | 5;
};

export async function searchClutches({
  opponentCount,
  steamIds,
  mapNames,
  startDate,
  endDate,
  demoSources,
  roundTagIds,
  matchTagIds,
}: Filter) {
  const { matchIndex, catalogs } = getStore();
  const steamIdSet = steamIds.length > 0 ? new Set(steamIds) : undefined;
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
    .toSorted((left, right) => right.date.localeCompare(left.date));

  const clutches: ClutchResult[] = [];
  for (const match of matches) {
    const rows = await readMatchEvents<ClutchRow>(match.checksum, 'clutches');
    const matchClutches = rows
      .filter((row) => {
        if (row.opponent_count !== opponentCount || !row.won) {
          return false;
        }
        if (steamIdSet && !steamIdSet.has(row.clutcher_steam_id)) {
          return false;
        }
        if (roundTagSet) {
          const hasTag = catalogs.roundTags.some(
            (tag) =>
              tag.checksum === match.checksum &&
              tag.round_number === row.round_number &&
              roundTagSet.has(String(tag.tag_id)),
          );
          if (!hasTag) {
            return false;
          }
        }
        return true;
      })
      .sort((left, right) => left.round_number - right.round_number || left.tick - right.tick);

    for (const row of matchClutches) {
      const comment =
        catalogs.roundComments.find(
          (item) => item.match_checksum === match.checksum && item.number === row.round_number,
        )?.comment ?? '';
      clutches.push({
        ...clutchRowToClutch(row),
        mapName: match.mapName,
        date: new Date(match.date).toISOString(),
        demoPath: match.demoPath,
        game: match.game,
        roundComment: comment,
      });
    }
  }

  return clutches;
}
