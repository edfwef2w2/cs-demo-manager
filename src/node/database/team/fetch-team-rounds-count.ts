import { TeamNumber } from 'csdm/common/types/counter-strike';
import { getFilteredTeamMatchIndexRows } from 'csdm/node/store/filter-matches';
import { readMatchDocument } from 'csdm/node/store/match-io';
import type { TeamFilters } from './team-filters';

type RoundCount = {
  totalCount: number;
  roundCountAsCt: number;
  roundCountAsT: number;
};

export async function fetchTeamRoundCount({ name, ...filters }: TeamFilters): Promise<RoundCount> {
  const checksums = getFilteredTeamMatchIndexRows(filters, name).map((row) => row.checksum);
  let totalCount = 0;
  let roundCountAsCt = 0;
  let roundCountAsT = 0;

  for (const checksum of checksums) {
    const document = await readMatchDocument(checksum);
    if (!document) {
      continue;
    }
    for (const round of document.rounds) {
      const isTeamA = round.team_a_name === name;
      const isTeamB = round.team_b_name === name;
      if (!isTeamA && !isTeamB) {
        continue;
      }
      totalCount += 1;
      if ((isTeamA && round.team_a_side === TeamNumber.CT) || (isTeamB && round.team_b_side === TeamNumber.CT)) {
        roundCountAsCt += 1;
      }
      if ((isTeamA && round.team_a_side === TeamNumber.T) || (isTeamB && round.team_b_side === TeamNumber.T)) {
        roundCountAsT += 1;
      }
    }
  }

  return { totalCount, roundCountAsCt, roundCountAsT };
}
