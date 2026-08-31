import { getFilteredPlayerMatchIndexRows } from 'csdm/node/store/filter-matches';
import { readMatchEvents } from 'csdm/node/store/match-io';
import type { MatchFilters } from '../match/apply-match-filters';
import type { Clutch } from 'csdm/common/types/clutch';
import { clutchRowToClutch } from '../clutches/clutch-row-to-clutch';
import type { ClutchRow } from '../clutches/clutch-table';

export async function fetchPlayerClutches(steamId: string, filters?: MatchFilters): Promise<Clutch[]> {
  const checksums = getFilteredPlayerMatchIndexRows(filters, steamId).map((row) => row.checksum);
  const clutches: Clutch[] = [];

  for (const checksum of checksums) {
    const rows = await readMatchEvents<ClutchRow>(checksum, 'clutches');
    for (const row of rows) {
      if (row.clutcher_steam_id === steamId) {
        clutches.push(clutchRowToClutch(row));
      }
    }
  }

  return clutches;
}
