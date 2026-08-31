import { flashbangExplodeRowToFlashbangExplode } from './flashbang-explode-row-to-flashbang-explode';
import type { FlashbangExplodeTable } from './flashbang-explode-table';
import { readMatchEvents } from 'csdm/node/store/match-io';

export async function fetchFlashbangsExplode(checksum: string, roundNumber: number) {
  const rows = (await readMatchEvents<FlashbangExplodeTable>(checksum, 'flashbangsExplode')).filter(
    (row) => row.round_number === roundNumber,
  );
  const flashbangsExplode = rows.map(flashbangExplodeRowToFlashbangExplode);

  return flashbangsExplode;
}
