import type { Clutch } from 'csdm/common/types/clutch';
import { clutchRowToClutch } from '../clutches/clutch-row-to-clutch';
import type { ClutchRow } from '../clutches/clutch-table';
import type { TeamFilters } from './team-filters';
import { getFilteredTeamMatchIndexRows } from 'csdm/node/store/filter-matches';
import { readMatchEvents } from 'csdm/node/store/match-io';
import { getStore } from 'csdm/node/store/store';

export async function fetchTeamClutches({ name, ...filters }: TeamFilters): Promise<Clutch[]> {
  const checksums = getFilteredTeamMatchIndexRows(filters, name).map((row) => row.checksum);
  const teamSteamIds = new Set(
    getStore()
      .playerMatchIndex.filter((row) => checksums.includes(row.checksum) && row.teamName === name)
      .map((row) => row.steamId),
  );

  const clutches: Clutch[] = [];
  for (const checksum of checksums) {
    const rows = await readMatchEvents<ClutchRow>(checksum, 'clutches');
    for (const row of rows) {
      if (teamSteamIds.has(row.clutcher_steam_id)) {
        clutches.push(clutchRowToClutch(row));
      }
    }
  }

  return clutches;
}
