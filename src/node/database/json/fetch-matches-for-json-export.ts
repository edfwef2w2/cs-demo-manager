import type { MatchJson } from 'csdm/node/json/match-json';
import { fetchMatchesByChecksums } from 'csdm/node/database/matches/fetch-matches-by-checksums';
import { fetchGrenadeProjectileDestroy } from 'csdm/node/database/grenade-projectile-destroy/fetch-grenade-projectiles-destroy';

export async function fetchMatchesForJsonExport(checksums: string[]): Promise<MatchJson[]> {
  const matches = await fetchMatchesByChecksums(checksums);
  const result: MatchJson[] = [];
  for (const match of matches) {
    const grenadeDestroyed = await fetchGrenadeProjectileDestroy(match.checksum);
    result.push({
      ...match,
      grenadeDestroyed,
    });
  }

  return result;
}
