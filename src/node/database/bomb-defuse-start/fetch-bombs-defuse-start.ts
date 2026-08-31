import { bombDefuseStartRowToBombDefuseStart } from './bomb-defuse-start-row-to-bomb-defuse-start';
import type { BombDefuseStartTable } from './bomb-defuse-start-table';
import type { MatchBombsDocument } from 'csdm/node/store/match-document';
import { readMatchJson } from 'csdm/node/store/match-io';

export async function fetchBombsDefuseStart(checksum: string, roundNumber: number) {
  const bombs = await readMatchJson<MatchBombsDocument>(checksum, 'bombs');
  const rows = ((bombs?.defuseStart ?? []) as BombDefuseStartTable[]).filter((row) => row.round_number === roundNumber);

  const bombsDefuseStart = rows.map((row) => {
    return bombDefuseStartRowToBombDefuseStart(row);
  });

  return bombsDefuseStart;
}
