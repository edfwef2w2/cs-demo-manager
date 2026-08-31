import type { WeaponName } from 'csdm/common/types/counter-strike';
import type { Shot } from 'csdm/common/types/shot';
import { shotRowToShot } from './shot-row-to-shot';
import type { ShotRow } from './shot-table';
import { readMatchEvents } from 'csdm/node/store/match-io';
import { getOverriddenSteamName } from 'csdm/node/store/steam-name';

type FetchShotsParameters = {
  checksum: string;
  roundNumber?: number;
  weaponNames?: WeaponName[];
};

export async function fetchShots({ checksum, roundNumber, weaponNames }: FetchShotsParameters): Promise<Shot[]> {
  let rows = await readMatchEvents<ShotRow>(checksum, 'shots');
  if (roundNumber !== undefined) {
    rows = rows.filter((row) => row.round_number === roundNumber);
  }
  if (Array.isArray(weaponNames) && weaponNames.length > 0) {
    rows = rows.filter((row) => weaponNames.includes(row.weapon_name));
  }

  return rows.map((row) => {
    return shotRowToShot({
      ...row,
      player_name: getOverriddenSteamName(row.player_steam_id, row.player_name),
    });
  });
}
