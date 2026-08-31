import { TeamLetter } from 'csdm/common/types/counter-strike';
import { getFilteredMatchIndexRows, getFilteredTeamMatchIndexRows } from 'csdm/node/store/filter-matches';
import type { TeamMatchSideStats } from 'csdm/common/types/team-match-side-stats';
import type { TeamFilters } from './team-filters';

export async function fetchTeamMatchSideStats(filters: TeamFilters): Promise<TeamMatchSideStats> {
  const teamRows = getFilteredTeamMatchIndexRows(filters, filters.name);
  const matches = new Map(getFilteredMatchIndexRows(filters).map((row) => [row.checksum, row]));

  let matchCount = 0;
  let matchCountStartedAsCt = 0;
  let matchWonCountStartedAsCt = 0;
  let matchTieCountStartedAsCt = 0;
  let matchCountStartedAsT = 0;
  let matchWonCountStartedAsT = 0;
  let matchTieCountStartedAsT = 0;

  for (const team of teamRows) {
    const match = matches.get(team.checksum);
    if (!match) {
      continue;
    }
    matchCount += 1;
    if (team.letter === TeamLetter.A) {
      matchCountStartedAsCt += 1;
      if (match.winnerName === filters.name) {
        matchWonCountStartedAsCt += 1;
      } else if (!match.winnerName) {
        matchTieCountStartedAsCt += 1;
      }
    } else if (team.letter === TeamLetter.B) {
      matchCountStartedAsT += 1;
      if (match.winnerName === filters.name) {
        matchWonCountStartedAsT += 1;
      } else if (!match.winnerName) {
        matchTieCountStartedAsT += 1;
      }
    }
  }

  return {
    matchCount,
    matchCountStartedAsCt,
    matchWonCountStartedAsCt,
    matchTieCountStartedAsCt,
    matchCountStartedAsT,
    matchWonCountStartedAsT,
    matchTieCountStartedAsT,
  };
}
