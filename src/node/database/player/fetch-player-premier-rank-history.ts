import { CompetitiveRank, type PremierRank } from 'csdm/common/types/counter-strike';
import { emptyMatchFilters, getFilteredPlayerMatchIndexRows } from 'csdm/node/store/filter-matches';
import type { MatchFilters } from '../match/apply-match-filters';
import type { PremierRankHistory } from 'csdm/common/types/charts/premier-rank-history';

export async function fetchPlayerPremierRankHistory(
  steamId: string,
  { startDate, endDate }: MatchFilters,
): Promise<PremierRankHistory[]> {
  return getFilteredPlayerMatchIndexRows({ ...emptyMatchFilters(), startDate, endDate }, steamId)
    .filter((row) => row.rank > CompetitiveRank.GlobalElite)
    .slice()
    .sort((left, right) => left.date.localeCompare(right.date))
    .map((row) => ({
      matchDate: new Date(row.date).toISOString(),
      rank: row.rank as PremierRank,
      winCount: row.winsCount,
    }));
}
