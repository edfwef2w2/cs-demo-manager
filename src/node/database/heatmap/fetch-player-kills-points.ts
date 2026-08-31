import type { PlayerHeatmapFilter } from 'csdm/common/types/heatmap-filters';
import type { Point } from 'csdm/common/types/point';
import { HeatmapEvent } from 'csdm/common/types/heatmap-event';
import { RadarLevel } from 'csdm/ui/maps/radar-level';
import { readMatchEvents } from 'csdm/node/store/match-io';
import type { KillRow } from '../kills/kill-table';
import { getPlayerHeatmapChecksums } from './heatmap-match-checksums';

export async function fetchPlayerKillsPoints(filters: PlayerHeatmapFilter): Promise<Point[]> {
  const checksums = getPlayerHeatmapChecksums(filters);
  const points: Point[] = [];

  for (const checksum of checksums) {
    const kills = await readMatchEvents<KillRow>(checksum, 'kills');
    for (const kill of kills) {
      const isKill = filters.event === HeatmapEvent.Kills;
      const isDeath = filters.event === HeatmapEvent.Deaths;
      if (!isKill && !isDeath) {
        throw new Error(`Unsupported kills points event: ${filters.event}`);
      }
      const steamId = isKill ? kill.killer_steam_id : kill.victim_steam_id;
      if (steamId !== filters.steamId) {
        continue;
      }
      const side = isKill ? kill.killer_side : kill.victim_side;
      const z = isKill ? kill.killer_z : kill.victim_z;
      if (filters.thresholdZ) {
        const isUpper = filters.radarLevel === RadarLevel.Upper;
        if (isUpper ? z < filters.thresholdZ : z >= filters.thresholdZ) {
          continue;
        }
      }
      if (filters.sides.length > 0 && !filters.sides.includes(side)) {
        continue;
      }
      points.push(isKill ? { x: kill.killer_x, y: kill.killer_y } : { x: kill.victim_x, y: kill.victim_y });
    }
  }

  return points;
}
