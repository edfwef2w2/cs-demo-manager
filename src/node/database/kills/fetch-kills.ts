import type { Kill } from 'csdm/common/types/kill';
import { killRowToKill } from './kill-row-to-kill';
import type { KillRow } from './kill-table';
import { readMatchEvents } from 'csdm/node/store/match-io';
import { getOverriddenSteamName } from 'csdm/node/store/steam-name';

export async function fetchKills(checksum: string, roundNumber?: number) {
  const rows = await readMatchEvents<KillRow>(checksum, 'kills');
  const filtered = typeof roundNumber === 'number' ? rows.filter((row) => row.round_number === roundNumber) : rows;

  const kills: Kill[] = filtered
    .toSorted((left, right) => left.tick - right.tick)
    .map((row) => {
      return killRowToKill({
        ...row,
        killer_name: getOverriddenSteamName(row.killer_steam_id, row.killer_name),
        victim_name: getOverriddenSteamName(row.victim_steam_id, row.victim_name),
        assister_name: row.assister_steam_id
          ? getOverriddenSteamName(row.assister_steam_id, row.assister_name)
          : row.assister_name,
      });
    });

  return kills;
}
