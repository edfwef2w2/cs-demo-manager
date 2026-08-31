import type { PlayerHeatmapFilter } from 'csdm/common/types/heatmap-filters';
import type { Point } from 'csdm/common/types/point';
import { RadarLevel } from 'csdm/ui/maps/radar-level';
import { readMatchEvents } from 'csdm/node/store/match-io';
import type { ShotRow } from '../shots/shot-table';
import { getPlayerHeatmapChecksums } from './heatmap-match-checksums';

export async function fetchPlayerShotsPoints(filters: PlayerHeatmapFilter): Promise<Point[]> {
  const checksums = getPlayerHeatmapChecksums(filters);
  const points: Point[] = [];
  for (const checksum of checksums) {
    const shots = await readMatchEvents<ShotRow>(checksum, 'shots');
    for (const shot of shots) {
      if (shot.player_steam_id !== filters.steamId) {
        continue;
      }
      if (filters.thresholdZ) {
        const isUpper = filters.radarLevel === RadarLevel.Upper;
        if (isUpper ? shot.z < filters.thresholdZ : shot.z >= filters.thresholdZ) {
          continue;
        }
      }
      if (filters.sides.length > 0 && !filters.sides.includes(shot.player_side)) {
        continue;
      }
      points.push({ x: shot.x, y: shot.y });
    }
  }
  return points;
}
