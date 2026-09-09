import { CompetitiveRank } from 'csdm/common/types/counter-strike';
import type { CompetitiveRankHistory } from 'csdm/common/types/charts/competitive-rank-history';
import { emptyMatchFilters, getFilteredPlayerMatchIndexRows } from 'csdm/node/store/filter-matches';
import type { MatchFilters } from '../match/apply-match-filters';

export async function fetchPlayerCompetitiveRankHistory(
  steamId: string,
  { startDate, endDate }: MatchFilters,
): Promise<CompetitiveRankHistory[]> {
  const rows = getFilteredPlayerMatchIndexRows({ ...emptyMatchFilters(), startDate, endDate }, steamId)
    .filter((row) => row.rank > CompetitiveRank.Unknown && row.rank <= CompetitiveRank.GlobalElite)
    .toSorted((left, right) => left.date.localeCompare(right.date));

  const rankHistories: CompetitiveRankHistory[] = [];
  let lastKnowRank: CompetitiveRank | -1 = -1;
  for (const row of rows) {
    const rank = row.rank as CompetitiveRank;
    if (lastKnowRank !== rank) {
      rankHistories.push({
        matchDate: new Date(row.date).toISOString(),
        rank,
        winCount: row.winsCount,
        oldRank: lastKnowRank === -1 ? (row.oldRank as CompetitiveRank) : lastKnowRank,
      });
    }
    lastKnowRank = rank;
  }

  return rankHistories;
}
