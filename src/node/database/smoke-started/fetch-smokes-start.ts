import { smokeStartRowToSmokeStart } from './smoke-start-row-to-smoke-start';
import type { SmokeStartTable } from './smoke-start-table';
import { readMatchEvents } from 'csdm/node/store/match-io';

export async function fetchSmokesStart(checksum: string, roundNumber: number) {
  const rows = (await readMatchEvents<SmokeStartTable>(checksum, 'smokesStart')).filter(
    (row) => row.round_number === roundNumber,
  );
  const smokesStart = rows.map(smokeStartRowToSmokeStart);

  return smokesStart;
}
