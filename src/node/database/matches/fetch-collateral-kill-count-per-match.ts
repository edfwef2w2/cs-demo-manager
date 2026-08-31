import { computeCollateralKillCount } from 'csdm/node/store/compute-collateral-kills';
import { getStore } from 'csdm/node/store/store';
import { readMatchEvents } from 'csdm/node/store/match-io';
import type { KillRow } from '../kills/kill-table';

export type CollateralKillPerMatch = { [checksum: string]: number };

export async function fetchCollateralKillCountPerMatch(checksums?: string[]): Promise<CollateralKillPerMatch> {
  const targetChecksums =
    Array.isArray(checksums) && checksums.length > 0 ? checksums : getStore().matchIndex.map((row) => row.checksum);

  const collateralKillCountPerMatch: CollateralKillPerMatch = {};
  for (const checksum of targetChecksums) {
    const kills = await readMatchEvents<KillRow>(checksum, 'kills');
    collateralKillCountPerMatch[checksum] = computeCollateralKillCount(kills);
  }

  return collateralKillCountPerMatch;
}
