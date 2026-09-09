import { type MatchFilters } from '../match/apply-match-filters';
import type { MapStats } from 'csdm/common/types/map-stats';
import { fetchPlayersMapsStats } from '../players/fetch-players-maps-stats';

export async function fetchPlayerMapsStats(steamId: string, filters?: MatchFilters): Promise<MapStats[]> {
  await Promise.resolve();
  return fetchPlayersMapsStats([steamId], filters);
}
