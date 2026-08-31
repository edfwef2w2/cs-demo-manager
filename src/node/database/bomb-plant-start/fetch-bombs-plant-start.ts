import { bombPlantStartRowToBombPlantStart } from './bomb-plant-start-row-to-bomb-plant-start';
import type { BombPlantStartTable } from './bomb-plant-start-table';
import type { MatchBombsDocument } from 'csdm/node/store/match-document';
import { readMatchJson } from 'csdm/node/store/match-io';

export async function fetchBombsPlantStart(checksum: string, roundNumber: number) {
  const bombs = await readMatchJson<MatchBombsDocument>(checksum, 'bombs');
  const rows = ((bombs?.plantStart ?? []) as BombPlantStartTable[]).filter((row) => row.round_number === roundNumber);

  const bombsPlantStart = rows.map((row) => {
    return bombPlantStartRowToBombPlantStart(row);
  });

  return bombsPlantStart;
}
