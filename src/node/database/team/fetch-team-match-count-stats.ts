import { getFilteredMatchIndexRows, getFilteredTeamMatchIndexRows } from 'csdm/node/store/filter-matches';
import type { TeamFilters } from './team-filters';

type PlayerMatchCountStats = {
  wonMatchCount: number;
  tiedMatchCount: number;
  lostMatchCount: number;
};

export async function fetchTeamMatchCountStats(filters: TeamFilters): Promise<PlayerMatchCountStats> {
  const teamRows = getFilteredTeamMatchIndexRows(filters, filters.name);
  const matches = new Map(getFilteredMatchIndexRows(filters).map((row) => [row.checksum, row]));

  let wonMatchCount = 0;
  let tiedMatchCount = 0;
  let lostMatchCount = 0;
  for (const team of teamRows) {
    const match = matches.get(team.checksum);
    if (!match) {
      continue;
    }
    if (!match.winnerName) {
      tiedMatchCount += 1;
    } else if (match.winnerName === filters.name) {
      wonMatchCount += 1;
    } else {
      lostMatchCount += 1;
    }
  }

  return { wonMatchCount, tiedMatchCount, lostMatchCount };
}
