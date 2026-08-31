import { WeaponType } from 'csdm/common/types/counter-strike';
import type { KillRow } from 'csdm/node/database/kills/kill-table';

const excludedWeaponTypes = new Set<WeaponType>([
  WeaponType.Equipment,
  WeaponType.Grenade,
  WeaponType.Unknown,
  WeaponType.World,
]);

export function computeCollateralKillCount(kills: Array<Pick<KillRow, 'tick' | 'killer_steam_id' | 'weapon_type'>>) {
  const counts = new Map<string, number>();
  for (const kill of kills) {
    if (excludedWeaponTypes.has(kill.weapon_type)) {
      continue;
    }
    const key = `${kill.tick}:${kill.killer_steam_id}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  let collateralKillCount = 0;
  for (const count of counts.values()) {
    if (count > 1) {
      collateralKillCount += 1;
    }
  }

  return collateralKillCount;
}
