import type { BombPlanted } from '../../../common/types/bomb-planted';
import { bombPlantedRowToBombPlanted } from './bomb-planted-row-to-bomb-planted';
import type { BombPlantedTable } from './bomb-planted-table';
import { readMatchJson } from 'csdm/node/store/match-io';
import type { MatchBombsDocument } from 'csdm/node/store/match-document';

export async function fetchBombsPlanted(checksum: string) {
  const bombs = await readMatchJson<MatchBombsDocument>(checksum, 'bombs');
  const rows = (bombs?.planted ?? []) as BombPlantedTable[];
  const bombsPlanted: BombPlanted[] = rows.map(bombPlantedRowToBombPlanted);

  return bombsPlanted;
}
