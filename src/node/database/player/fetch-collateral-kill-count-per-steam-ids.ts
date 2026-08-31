import { WeaponType } from 'csdm/common/types/counter-strike';
import { computeCollateralKillCount } from 'csdm/node/store/compute-collateral-kills';
import { readMatchEvents } from 'csdm/node/store/match-io';
import type { KillRow } from '../kills/kill-table';

export async function fetchCollateralKillCountPerSteamId(checksum: string) {
  const kills = await readMatchEvents<KillRow>(checksum, 'kills');
  const bySteamId = new Map<string, KillRow[]>();
  for (const kill of kills) {
    if (
      kill.weapon_type === WeaponType.Equipment ||
      kill.weapon_type === WeaponType.Grenade ||
      kill.weapon_type === WeaponType.Unknown ||
      kill.weapon_type === WeaponType.World
    ) {
      continue;
    }
    const current = bySteamId.get(kill.killer_steam_id) ?? [];
    current.push(kill);
    bySteamId.set(kill.killer_steam_id, current);
  }

  const collateralKillCountPerSteamId: { [steamId: string]: number } = {};
  for (const [steamId, playerKills] of bySteamId) {
    collateralKillCountPerSteamId[steamId] = computeCollateralKillCount(playerKills);
  }

  return collateralKillCountPerSteamId;
}
