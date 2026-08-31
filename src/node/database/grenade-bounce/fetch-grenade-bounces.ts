import { grenadeBounceRowToGrenadeBounce } from './grenade-bounce-row-to-grenade-bounce';
import type { GrenadeBounceTable } from './grenade-bounce-table';
import { readMatchEvents } from 'csdm/node/store/match-io';

export async function fetchGrenadeBounces(checksum: string) {
  const rows = await readMatchEvents<GrenadeBounceTable>(checksum, 'grenadeBounces');
  const grenadeBounces = rows.map(grenadeBounceRowToGrenadeBounce);

  return grenadeBounces;
}
