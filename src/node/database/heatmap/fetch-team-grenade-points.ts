import { GrenadeName } from 'csdm/common/types/counter-strike';
import type { TeamHeatmapFilter } from 'csdm/common/types/heatmap-filters';
import type { Point } from 'csdm/common/types/point';
import { HeatmapEvent } from 'csdm/common/types/heatmap-event';
import { RadarLevel } from 'csdm/ui/maps/radar-level';
import { readMatchEvents } from 'csdm/node/store/match-io';
import type { GrenadeProjectileDestroyTable } from '../grenade-projectile-destroy/grenade-projectile-destroy-table';
import { getTeamHeatmapChecksums } from './heatmap-match-checksums';

function grenadeNamesForEvent(event: HeatmapEvent): GrenadeName[] {
  switch (event) {
    case HeatmapEvent.Smoke:
      return [GrenadeName.Smoke];
    case HeatmapEvent.Decoy:
      return [GrenadeName.Decoy];
    case HeatmapEvent.Flashbang:
      return [GrenadeName.Flashbang];
    case HeatmapEvent.HeGrenade:
      return [GrenadeName.HE];
    case HeatmapEvent.Molotov:
      return [GrenadeName.Molotov, GrenadeName.Incendiary];
    default:
      throw new Error(`Unsupported grenade event: ${event}`);
  }
}

export async function fetchTeamGrenadePoints(filters: TeamHeatmapFilter): Promise<Point[]> {
  const grenadeNames = grenadeNamesForEvent(filters.event);
  const checksums = getTeamHeatmapChecksums(filters);
  const steamIds = filters.players.map((player) => player.steamId);
  const points: Point[] = [];
  for (const checksum of checksums) {
    const rows = await readMatchEvents<GrenadeProjectileDestroyTable>(checksum, 'grenadeProjectilesDestroy');
    for (const row of rows) {
      if (row.thrower_team_name !== filters.teamName || !grenadeNames.includes(row.grenade_name)) {
        continue;
      }
      if (steamIds.length > 0 && !steamIds.includes(row.thrower_steam_id)) {
        continue;
      }
      if (filters.thresholdZ) {
        const isUpper = filters.radarLevel === RadarLevel.Upper;
        if (isUpper ? row.z < filters.thresholdZ : row.z >= filters.thresholdZ) {
          continue;
        }
      }
      if (filters.sides.length > 0 && !filters.sides.includes(row.thrower_side)) {
        continue;
      }
      points.push({ x: row.x, y: row.y });
    }
  }
  return points;
}
