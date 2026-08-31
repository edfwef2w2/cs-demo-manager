import { grenadeProjectileDestroyRowToGrenadeProjectileDestroy } from './grenade-projectile-destroy-row-to-grenade-projectile-destroy';
import type { GrenadeProjectileDestroyTable } from './grenade-projectile-destroy-table';
import { readMatchEvents } from 'csdm/node/store/match-io';

export async function fetchGrenadeProjectileDestroy(checksum: string) {
  const rows = await readMatchEvents<GrenadeProjectileDestroyTable>(checksum, 'grenadeProjectilesDestroy');
  const grenadeProjectilesDestroy = rows.map(grenadeProjectileDestroyRowToGrenadeProjectileDestroy);

  return grenadeProjectilesDestroy;
}
