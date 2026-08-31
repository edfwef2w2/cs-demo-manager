import { heGrenadeExplodeRowToHeGrenadeExplode } from './he-grenade-explode-row-to-he-grenade-explode';
import type { HeGrenadeExplodeTable } from './he-grenade-explode-table';
import { readMatchEvents } from 'csdm/node/store/match-io';

export async function fetchHeGrenadesExplode(checksum: string, roundNumber: number) {
  const rows = (await readMatchEvents<HeGrenadeExplodeTable>(checksum, 'heGrenadesExplode')).filter(
    (row) => row.round_number === roundNumber,
  );
  const heGrenadesExplode = rows.map(heGrenadeExplodeRowToHeGrenadeExplode);

  return heGrenadesExplode;
}
