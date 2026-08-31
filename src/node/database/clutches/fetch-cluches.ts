import type { Clutch } from 'csdm/common/types/clutch';
import { clutchRowToClutch } from './clutch-row-to-clutch';
import type { ClutchRow } from './clutch-table';
import { readMatchEvents } from 'csdm/node/store/match-io';

export async function fetchClutches(checksum: string) {
  const clutchRows = await readMatchEvents<ClutchRow>(checksum, 'clutches');
  const clutches: Clutch[] = clutchRows.map((row) => {
    return clutchRowToClutch(row);
  });

  return clutches;
}
