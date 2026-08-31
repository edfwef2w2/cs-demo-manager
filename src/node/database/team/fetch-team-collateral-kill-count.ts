import { computeCollateralKillCount } from 'csdm/node/store/compute-collateral-kills';
import { getFilteredTeamMatchIndexRows } from 'csdm/node/store/filter-matches';
import { readMatchEvents } from 'csdm/node/store/match-io';
import type { KillRow } from '../kills/kill-table';
import type { TeamFilters } from './team-filters';

export async function fetchTeamCollateralKillCount(filters: TeamFilters) {
  const checksums = getFilteredTeamMatchIndexRows(filters, filters.name).map((row) => row.checksum);
  let collateralKillCount = 0;

  for (const checksum of checksums) {
    const kills = (await readMatchEvents<KillRow>(checksum, 'kills')).filter(
      (kill) => kill.killer_team_name === filters.name,
    );
    collateralKillCount += computeCollateralKillCount(kills);
  }

  return collateralKillCount;
}
