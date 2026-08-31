import { readMatchEvents } from 'csdm/node/store/match-io';
import type { ShotRow } from '../shots/shot-table';
import type { DamageTable } from '../damages/damage-table';
import type { KillRow } from '../kills/kill-table';

export type WeaponRow = {
  weaponName: string;
  killCount: number;
  shotCount: number;
  hitCount: number;
  healthDamage: number;
  armorDamage: number;
};

export async function fetchWeaponsRows(checksums: string[]) {
  const byWeapon = new Map<string, WeaponRow>();

  function rowFor(weaponName: string) {
    const current = byWeapon.get(weaponName);
    if (current) {
      return current;
    }
    const created: WeaponRow = {
      weaponName,
      killCount: 0,
      shotCount: 0,
      hitCount: 0,
      healthDamage: 0,
      armorDamage: 0,
    };
    byWeapon.set(weaponName, created);
    return created;
  }

  for (const checksum of checksums) {
    const [shots, damages, kills] = await Promise.all([
      readMatchEvents<ShotRow>(checksum, 'shots'),
      readMatchEvents<DamageTable>(checksum, 'damages'),
      readMatchEvents<KillRow>(checksum, 'kills'),
    ]);
    for (const shot of shots) {
      rowFor(shot.weapon_name).shotCount += 1;
    }
    for (const damage of damages) {
      const row = rowFor(damage.weapon_name);
      row.hitCount += 1;
      row.healthDamage += damage.health_damage;
      row.armorDamage += damage.armor_damage;
    }
    for (const kill of kills) {
      rowFor(kill.weapon_name).killCount += 1;
    }
  }

  return [...byWeapon.values()];
}
