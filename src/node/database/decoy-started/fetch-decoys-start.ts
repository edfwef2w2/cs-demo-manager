import { decoyStartRowToDecoyStart } from './decoy-start-row-to-decoy-start';
import type { DecoyStartTable } from './decoy-start-table';
import { readMatchEvents } from 'csdm/node/store/match-io';

export async function fetchDecoysStart(checksum: string, roundNumber: number) {
  const rows = (await readMatchEvents<DecoyStartTable>(checksum, 'decoysStart')).filter(
    (row) => row.round_number === roundNumber,
  );

  const decoysStart = rows.map(decoyStartRowToDecoyStart);

  return decoysStart;
}
