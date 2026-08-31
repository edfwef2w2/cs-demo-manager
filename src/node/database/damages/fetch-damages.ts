import { damageRowToDamage } from './damage-row-to-damage';
import type { Damage } from 'csdm/common/types/damage';
import type { DamageTable } from './damage-table';
import { readMatchEvents } from 'csdm/node/store/match-io';

export async function fetchDamages(checksum: string) {
  const rows = await readMatchEvents<DamageTable>(checksum, 'damages');
  const damages: Damage[] = rows.map(damageRowToDamage);

  return damages;
}
