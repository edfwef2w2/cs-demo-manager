import type { Point } from 'csdm/common/types/point';
import type { MatchHeatmapFilter } from 'csdm/common/types/heatmap-filters';
import { RadarLevel } from 'csdm/ui/maps/radar-level';
import { readMatchEvents } from 'csdm/node/store/match-io';
import type { ShotRow } from '../shots/shot-table';

export async function fetchMatchShotsPoints(filters: MatchHeatmapFilter): Promise<Point[]> {
  const shots = await readMatchEvents<ShotRow>(filters.checksum, 'shots');
  return shots
    .filter((shot) => {
      if (filters.thresholdZ) {
        const isUpper = filters.radarLevel === RadarLevel.Upper;
        if (isUpper ? shot.z < filters.thresholdZ : shot.z >= filters.thresholdZ) {
          return false;
        }
      }
      if (filters.rounds.length > 0 && !filters.rounds.includes(shot.round_number)) {
        return false;
      }
      if (filters.sides.length > 0 && !filters.sides.includes(shot.player_side)) {
        return false;
      }
      if (filters.steamIds.length > 0 && !filters.steamIds.includes(shot.player_steam_id)) {
        return false;
      }
      if (filters.teamNames.length > 0 && !filters.teamNames.includes(shot.player_team_name)) {
        return false;
      }
      return true;
    })
    .map((shot) => {
      return { x: shot.x, y: shot.y };
    });
}
