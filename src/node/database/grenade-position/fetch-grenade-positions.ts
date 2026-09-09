import { grenadePositionRowToGrenadePosition } from './grenade-position-row-to-grenade-position';
import type { GrenadePositionTable } from './grenade-position-table';
import { fillMissingTicks } from 'csdm/common/array/fill-missing-ticks';
import { csvColumns, parseCsvFile } from 'csdm/node/store/parse-csv';
import { getMatchPositionFilePath } from 'csdm/node/store/match-io';

function uniqueByTickAndProjectile(rows: GrenadePositionTable[]) {
  const seen = new Set<string>();
  const unique: GrenadePositionTable[] = [];
  for (const row of rows) {
    const key = `${row.tick}:${row.projectile_id}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(row);
  }
  return unique;
}

export async function fetchGrenadePositions(checksum: string, roundNumber: number) {
  const rows = await parseCsvFile<GrenadePositionTable>(
    getMatchPositionFilePath(checksum, 'grenades'),
    csvColumns([
      ['frame', 'number'],
      ['tick', 'number'],
      ['round_number', 'number'],
      ['grenade_id', 'string'],
      ['projectile_id', 'string'],
      ['grenade_name', 'string'],
      ['x', 'number'],
      ['y', 'number'],
      ['z', 'number'],
      ['thrower_steam_id', 'string'],
      ['thrower_name', 'string'],
      ['thrower_side', 'number'],
      ['thrower_team_name', 'string'],
      ['thrower_velocity_x', 'number'],
      ['thrower_velocity_y', 'number'],
      ['thrower_velocity_z', 'number'],
      ['thrower_yaw', 'number'],
      ['thrower_pitch', 'number'],
      ['match_checksum', 'string'],
    ]),
  );

  const filtered = uniqueByTickAndProjectile(rows.filter((row) => row.round_number === roundNumber))
    .toSorted((left, right) => left.tick - right.tick)
    .map((row, index) => {
      return { ...row, id: index + 1 };
    });

  const grenadePositions = fillMissingTicks(filtered.map(grenadePositionRowToGrenadePosition));

  return grenadePositions;
}
