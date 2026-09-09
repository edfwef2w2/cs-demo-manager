import { bombPlantedRowToBombPlanted } from './bomb-planted-row-to-bomb-planted';
import type { BombPlantedTable } from './bomb-planted-table';
import { readMatchJson } from 'csdm/node/store/match-io';
import type { MatchBombsDocument } from 'csdm/node/store/match-document';
import { getOverriddenSteamName } from 'csdm/node/store/steam-name';

export async function fetchBombPlanted(checksum: string, roundNumber: number) {
  const bombs = await readMatchJson<MatchBombsDocument>(checksum, 'bombs');
  const rows = (bombs?.planted ?? []) as BombPlantedTable[];
  const row = rows.find((item) => item.round_number === roundNumber);
  if (row === undefined) {
    return null;
  }

  return bombPlantedRowToBombPlanted({
    ...row,
    planter_name: getOverriddenSteamName(row.planter_steam_id, row.planter_name),
  });
}
