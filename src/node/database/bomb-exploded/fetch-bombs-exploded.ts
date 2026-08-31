import type { BombExploded } from '../../../common/types/bomb-exploded';
import { bombExplodedRowToBombExploded } from './bomb-exploded-row-to-bomb-exploded';
import type { BombExplodedTable } from './bomb-exploded-table';
import type { MatchBombsDocument } from 'csdm/node/store/match-document';
import { readMatchJson } from 'csdm/node/store/match-io';

export async function fetchBombsExploded(checksum: string) {
  const bombs = await readMatchJson<MatchBombsDocument>(checksum, 'bombs');
  const rows = (bombs?.exploded ?? []) as BombExplodedTable[];
  const bombsExploded: BombExploded[] = rows.map(bombExplodedRowToBombExploded);

  return bombsExploded;
}
