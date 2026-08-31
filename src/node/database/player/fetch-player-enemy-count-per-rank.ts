import { DemoSource, type Rank } from 'csdm/common/types/counter-strike';
import { getFilteredPlayerMatchIndexRows } from 'csdm/node/store/filter-matches';
import { getStore } from 'csdm/node/store/store';
import type { MatchFilters } from '../match/apply-match-filters';

export async function fetchPlayerEnemyCountPerRank(
  steamId: string,
  filters: MatchFilters,
): Promise<Record<Rank, number>> {
  const valveFilters = { ...filters, demoSources: [DemoSource.Valve] };
  const playerChecksums = new Set(getFilteredPlayerMatchIndexRows(valveFilters, steamId).map((row) => row.checksum));
  const { playerMatchIndex } = getStore();

  const enemyCountPerRank: Record<Rank, number> = {};
  for (const row of playerMatchIndex) {
    if (!playerChecksums.has(row.checksum) || row.steamId === steamId) {
      continue;
    }
    if (row.source !== DemoSource.Valve) {
      continue;
    }
    enemyCountPerRank[row.rank] = (enemyCountPerRank[row.rank] ?? 0) + 1;
  }

  return enemyCountPerRank;
}
