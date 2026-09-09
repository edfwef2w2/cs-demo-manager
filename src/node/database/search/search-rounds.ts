import type { SearchFilter } from 'csdm/common/types/search/search-filter';
import type { RoundResult } from 'csdm/common/types/search/round-result';
import { roundRowToRound } from '../rounds/round-row-to-round';
import { getStore } from 'csdm/node/store/store';
import { readMatchDocument } from 'csdm/node/store/match-io';

type Filter = SearchFilter;

export async function searchRounds({
  steamIds,
  mapNames,
  startDate,
  endDate,
  demoSources,
  roundTagIds,
  matchTagIds,
}: Filter) {
  const { matchIndex, playerMatchIndex, catalogs } = getStore();
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
      if (steamIdSet) {
        const hasPlayer = playerMatchIndex.some(
          (player) => player.checksum === row.checksum && steamIdSet.has(player.steamId),
        );
        if (!hasPlayer) {
          return false;
        }
      }
      return true;
    })
    .toSorted((left, right) => right.date.localeCompare(left.date));

  const rounds: RoundResult[] = [];
  for (const match of matches) {
    const document = await readMatchDocument(match.checksum);
    if (!document) {
      continue;
    }

    for (const round of document.rounds.toSorted((left, right) => left.number - right.number)) {
      const tagIds = catalogs.roundTags
        .filter((tag) => tag.checksum === match.checksum && tag.round_number === round.number)
        .map((tag) => String(tag.tag_id));
      if (roundTagSet && !tagIds.some((tagId) => roundTagSet.has(tagId))) {
        continue;
      }

      const comment =
        catalogs.roundComments.find((item) => item.match_checksum === match.checksum && item.number === round.number)
          ?.comment ?? '';

      rounds.push({
        ...roundRowToRound(round, tagIds, comment),
        mapName: match.mapName,
        date: new Date(match.date).toISOString(),
        demoPath: match.demoPath,
        game: match.game,
        comment,
      });
    }
  }

  return rounds;
}
