import type { BombDefused } from '../../../common/types/bomb-defused';
import { bombDefusedRowToBombDefused } from './bomb-defused-row-to-bomb-defused';
import type { BombDefusedTable } from './bomb-defused-table';
import type { MatchBombsDocument } from 'csdm/node/store/match-document';
import { readMatchJson } from 'csdm/node/store/match-io';

export async function fetchBombsDefused(checksum: string) {
  const bombs = await readMatchJson<MatchBombsDocument>(checksum, 'bombs');
  const rows = (bombs?.defused ?? []) as BombDefusedTable[];
  const bombsDefused: BombDefused[] = rows.map(bombDefusedRowToBombDefused);

  return bombsDefused;
}
