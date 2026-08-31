import type { ChickenDeath } from '../../../common/types/chicken-death';
import { chickenDeathRowToChickenDeath } from './chicken-death-row-to-chicken-death';
import type { ChickenDeathTable } from './chicken-death-table';
import { readMatchEvents } from 'csdm/node/store/match-io';

export async function fetchChickenDeaths(checksum: string): Promise<ChickenDeath[]> {
  const rows = await readMatchEvents<ChickenDeathTable>(checksum, 'chickenDeaths');
  const chickenDeaths: ChickenDeath[] = rows.map((row) => {
    return chickenDeathRowToChickenDeath(row);
  });

  return chickenDeaths;
}
