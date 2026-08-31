import type { BombDefused } from '../../../common/types/bomb-defused';
import { bombDefusedRowToBombDefused } from './bomb-defused-row-to-bomb-defused';
import type { BombDefusedTable } from './bomb-defused-table';
import type { MatchBombsDocument } from 'csdm/node/store/match-document';
import { readMatchJson } from 'csdm/node/store/match-io';
import { getOverriddenSteamName } from 'csdm/node/store/steam-name';

export async function fetchBombDefused(checksum: string, roundNumber: number) {
  const bombs = await readMatchJson<MatchBombsDocument>(checksum, 'bombs');
  const rows = ((bombs?.defused ?? []) as BombDefusedTable[])
    .filter((row) => row.round_number === roundNumber)
    .slice()
    .sort((left, right) => left.tick - right.tick);
  const row = rows[0];

  let bombDefused: BombDefused | null = null;
  if (row !== undefined) {
    bombDefused = bombDefusedRowToBombDefused({
      ...row,
      defuser_name: getOverriddenSteamName(row.defuser_steam_id, row.defuser_name),
    });
  }

  return bombDefused;
}
