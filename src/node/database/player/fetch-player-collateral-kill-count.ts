import { WeaponType } from 'csdm/common/types/counter-strike';
import { type MatchFilters } from '../match/apply-match-filters';
import { getFilteredPlayerMatchIndexRows } from 'csdm/node/store/filter-matches';
import { readMatchEvents } from 'csdm/node/store/match-io';
import type { KillRow } from '../kills/kill-table';
import { computeCollateralKillCount } from 'csdm/node/store/compute-collateral-kills';

export async function fetchPlayerCollateralKillCount(steamId: string, filters?: MatchFilters) {
  const playerRows = getFilteredPlayerMatchIndexRows(filters, steamId);
  let collateralKillCount = 0;
  for (const row of playerRows) {
    const kills = await readMatchEvents<KillRow>(row.checksum, 'kills');
    collateralKillCount += computeCollateralKillCount(
      kills.filter((kill) => kill.killer_steam_id === steamId && kill.weapon_type !== WeaponType.Equipment),
    );
  }

  return collateralKillCount;
}
