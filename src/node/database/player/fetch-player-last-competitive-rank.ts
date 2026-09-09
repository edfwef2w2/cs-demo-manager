import { CompetitiveRank, DemoSource } from 'csdm/common/types/counter-strike';
import { getFilteredPlayerMatchIndexRows } from 'csdm/node/store/filter-matches';
import type { MatchFilters } from '../match/apply-match-filters';

export async function fetchPlayerLastCompetitiveRank(
  steamId: string,
  filters?: MatchFilters,
): Promise<CompetitiveRank> {
  const rows = getFilteredPlayerMatchIndexRows(filters, steamId)
    .filter(
      (row) =>
        row.source === DemoSource.Valve &&
        row.rank > CompetitiveRank.Unknown &&
        row.rank <= CompetitiveRank.GlobalElite,
    )
    .toSorted((left, right) => right.date.localeCompare(left.date));

  return (rows[0]?.rank as CompetitiveRank) ?? CompetitiveRank.Unknown;
}
