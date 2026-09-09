import type { NinjaDefuseResult } from 'csdm/common/types/search/ninja-defuse-result';
import { bombDefusedRowToBombDefused } from '../bomb-defused/bomb-defused-row-to-bomb-defused';
import type { BombDefusedTable } from '../bomb-defused/bomb-defused-table';
import type { SearchFilter } from 'csdm/common/types/search/search-filter';
import type { MatchBombsDocument } from 'csdm/node/store/match-document';
import { getStore } from 'csdm/node/store/store';
import { readMatchJson } from 'csdm/node/store/match-io';

type Filter = SearchFilter;

export async function searchNinjaDefuse({
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

  const bombsDefused: NinjaDefuseResult[] = [];
  for (const match of matches) {
    const bombs = await readMatchJson<MatchBombsDocument>(match.checksum, 'bombs');
    const rows = ((bombs?.defused ?? []) as BombDefusedTable[])
      .filter((row) => {
        if (row.t_alive_count <= 0) {
          return false;
        }
        if (steamIdSet && !steamIdSet.has(row.defuser_steam_id)) {
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

    for (const row of rows) {
      const comment =
        catalogs.roundComments.find(
          (item) => item.match_checksum === match.checksum && item.number === row.round_number,
        )?.comment ?? '';
      bombsDefused.push({
        ...bombDefusedRowToBombDefused(row),
        mapName: match.mapName,
        date: new Date(match.date).toISOString(),
        demoPath: match.demoPath,
        game: match.game,
        roundComment: comment,
      });
    }
  }

  return bombsDefused;
}
