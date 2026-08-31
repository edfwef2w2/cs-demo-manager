import type { MatchHeatmapFilter } from 'csdm/common/types/heatmap-filters';
import type { Point } from 'csdm/common/types/point';
import { HeatmapEvent } from 'csdm/common/types/heatmap-event';
import { RadarLevel } from 'csdm/ui/maps/radar-level';
import { readMatchEvents } from 'csdm/node/store/match-io';
import type { KillRow } from '../kills/kill-table';

export async function fetchMatchKillsPoints(filters: MatchHeatmapFilter): Promise<Point[]> {
  const kills = await readMatchEvents<KillRow>(filters.checksum, 'kills');

  const matchesFilters = (kill: KillRow, side: number, steamId: string, teamName: string | null, z: number) => {
    if (filters.thresholdZ) {
      const isUpper = filters.radarLevel === RadarLevel.Upper;
      if (isUpper ? z < filters.thresholdZ : z >= filters.thresholdZ) {
        return false;
      }
    }
    if (filters.rounds.length > 0 && !filters.rounds.includes(kill.round_number)) {
      return false;
    }
    if (filters.sides.length > 0 && !filters.sides.includes(side as never)) {
      return false;
    }
    if (filters.steamIds.length > 0 && !filters.steamIds.includes(steamId)) {
      return false;
    }
    if (filters.teamNames.length > 0 && (!teamName || !filters.teamNames.includes(teamName))) {
      return false;
    }
    return true;
  };

  switch (filters.event) {
    case HeatmapEvent.Kills:
      return kills
        .filter((kill) =>
          matchesFilters(kill, kill.killer_side, kill.killer_steam_id, kill.killer_team_name, kill.killer_z),
        )
        .map((kill) => {
          return { x: kill.killer_x, y: kill.killer_y };
        });
    case HeatmapEvent.Deaths:
      return kills
        .filter((kill) =>
          matchesFilters(kill, kill.victim_side, kill.victim_steam_id, kill.victim_team_name, kill.victim_z),
        )
        .map((kill) => {
          return { x: kill.victim_x, y: kill.victim_y };
        });
    default:
      throw new Error(`Unsupported kills points event: ${filters.event}`);
  }
}
