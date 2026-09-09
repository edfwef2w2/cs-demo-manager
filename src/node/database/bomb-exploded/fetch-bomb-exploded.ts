import type { BombExploded } from '../../../common/types/bomb-exploded';
import { bombExplodedRowToBombExploded } from './bomb-exploded-row-to-bomb-exploded';
import type { BombExplodedTable } from './bomb-exploded-table';
import type { MatchBombsDocument } from 'csdm/node/store/match-document';
import { readMatchJson } from 'csdm/node/store/match-io';
import { getOverriddenSteamName } from 'csdm/node/store/steam-name';

export async function fetchBombExploded(checksum: string, roundNumber: number) {
  const bombs = await readMatchJson<MatchBombsDocument>(checksum, 'bombs');
  const rows = ((bombs?.exploded ?? []) as BombExplodedTable[])
    .filter((row) => row.round_number === roundNumber)
    .toSorted((left, right) => left.tick - right.tick);
  const row = rows[0];

  let bombExploded: BombExploded | null = null;
  if (row !== undefined) {
    bombExploded = bombExplodedRowToBombExploded({
      ...row,
      planter_name: getOverriddenSteamName(row.planter_steam_id, row.planter_name),
    });
  }

  return bombExploded;
}
