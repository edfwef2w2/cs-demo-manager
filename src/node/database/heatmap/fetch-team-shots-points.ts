import type { TeamHeatmapFilter } from 'csdm/common/types/heatmap-filters';
import type { Point } from 'csdm/common/types/point';
import { RadarLevel } from 'csdm/ui/maps/radar-level';
import { readMatchEvents } from 'csdm/node/store/match-io';
import type { ShotRow } from '../shots/shot-table';
import { getTeamHeatmapChecksums } from './heatmap-match-checksums';

export async function fetchTeamShotsPoints(filters: TeamHeatmapFilter): Promise<Point[]> {
  const checksums = getTeamHeatmapChecksums(filters);
  const steamIds = filters.players.map((player) => player.steamId);
  const points: Point[] = [];
  for (const checksum of checksums) {
    const shots = await readMatchEvents<ShotRow>(checksum, 'shots');
    for (const shot of shots) {
      if (shot.player_team_name !== filters.teamName) {
        continue;
      }
      if (steamIds.length > 0 && !steamIds.includes(shot.player_steam_id)) {
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
