import type { PremierRank } from 'csdm/common/types/counter-strike';
import { CompetitiveRank, DemoSource, Game } from 'csdm/common/types/counter-strike';
import { getFilteredPlayerMatchIndexRows } from 'csdm/node/store/filter-matches';
import type { MatchFilters } from '../match/apply-match-filters';

export async function fetchPlayerLastPremierRank(steamId: string, filters?: MatchFilters): Promise<PremierRank> {
  const rows = getFilteredPlayerMatchIndexRows(filters, steamId)
    .filter(
      (row) =>
        row.source === DemoSource.Valve &&
        row.game !== Game.CSGO &&
        row.rank > CompetitiveRank.Unknown &&
        row.rank > CompetitiveRank.GlobalElite,
    )
    .slice()
    .sort((left, right) => right.date.localeCompare(left.date));

  return rows[0]?.rank ?? 0;
}
