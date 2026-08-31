import { GrenadeName } from 'csdm/common/types/counter-strike';
import type { Point } from 'csdm/common/types/point';
import type { MatchHeatmapFilter } from 'csdm/common/types/heatmap-filters';
import { HeatmapEvent } from 'csdm/common/types/heatmap-event';
import { RadarLevel } from 'csdm/ui/maps/radar-level';
import { readMatchEvents } from 'csdm/node/store/match-io';
import type { GrenadeProjectileDestroyTable } from '../grenade-projectile-destroy/grenade-projectile-destroy-table';

function grenadeNamesForEvent(event: HeatmapEvent) {
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

export async function fetchMatchGrenadePoints(filters: MatchHeatmapFilter): Promise<Point[]> {
  const grenadeNames = grenadeNamesForEvent(filters.event);
  const rows = await readMatchEvents<GrenadeProjectileDestroyTable>(filters.checksum, 'grenadeProjectilesDestroy');
  return rows
    .filter((row) => {
      if (!grenadeNames.includes(row.grenade_name)) {
        return false;
      }
      if (filters.thresholdZ) {
        const isUpper = filters.radarLevel === RadarLevel.Upper;
        if (isUpper ? row.z < filters.thresholdZ : row.z >= filters.thresholdZ) {
          return false;
        }
      }
      if (filters.sides.length > 0 && !filters.sides.includes(row.thrower_side)) {
        return false;
      }
      if (filters.steamIds.length > 0 && !filters.steamIds.includes(row.thrower_steam_id)) {
        return false;
      }
      if (filters.rounds.length > 0 && !filters.rounds.includes(row.round_number)) {
        return false;
      }
      if (filters.teamNames.length > 0 && !filters.teamNames.includes(row.thrower_team_name)) {
        return false;
      }
      return true;
    })
    .map((row) => {
      return { x: row.x, y: row.y };
    });
}
