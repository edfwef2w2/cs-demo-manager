import type { PlayerPosition } from '../../../common/types/player-position';
import { playerPositionRowToPlayerPosition } from './player-position-row-to-player-position';
import type { PlayerPositionTable } from './player-position-table';
import { fillMissingTicks } from 'csdm/common/array/fill-missing-ticks';
import { csvColumns, parseCsvFile } from 'csdm/node/store/parse-csv';
import { getMatchPositionFilePath } from 'csdm/node/store/match-io';
import { getOverriddenSteamName } from 'csdm/node/store/steam-name';

function uniqueByTickAndSteamId(rows: PlayerPositionTable[]) {
  const seen = new Set<string>();
  const unique: PlayerPositionTable[] = [];
  for (const row of rows) {
    const key = `${row.tick}:${row.player_steam_id}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(row);
  }
  return unique;
}

export async function fetchPlayersPositions(checksum: string, roundNumber: number) {
  const rows = await parseCsvFile<PlayerPositionTable>(
    getMatchPositionFilePath(checksum, 'players'),
    csvColumns([
      ['frame', 'number'],
      ['tick', 'number'],
      ['is_alive', 'boolean'],
      ['x', 'number'],
      ['y', 'number'],
      ['z', 'number'],
      ['yaw', 'number'],
      ['flash_duration_remaining', 'number'],
      ['side', 'number'],
      ['money', 'number'],
      ['health', 'number'],
      ['armor', 'number'],
      ['has_helmet', 'boolean'],
      ['has_bomb', 'boolean'],
      ['has_defuse_kit', 'boolean'],
      ['is_ducking', 'boolean'],
      ['is_airborne', 'boolean'],
      ['is_scoping', 'boolean'],
      ['is_defusing', 'boolean'],
      ['is_planting', 'boolean'],
      ['is_grabbing_hostage', 'boolean'],
      ['active_weapon_name', 'string'],
      ['equipments', 'nullable-string'],
      ['grenades', 'nullable-string'],
      ['pistols', 'nullable-string'],
      ['smgs', 'nullable-string'],
      ['rifles', 'nullable-string'],
      ['heavy', 'nullable-string'],
      ['player_steam_id', 'string'],
      ['player_name', 'string'],
      ['round_number', 'number'],
      ['match_checksum', 'string'],
    ]),
  );

  const filtered = uniqueByTickAndSteamId(rows.filter((row) => row.round_number === roundNumber))
    .slice()
    .sort((left, right) => left.tick - right.tick || left.player_steam_id.localeCompare(right.player_steam_id))
    .map((row, index) => {
      return {
        ...row,
        id: index + 1,
        player_name: getOverriddenSteamName(row.player_steam_id, row.player_name),
      };
    });

  const playerPositions: PlayerPosition[] = fillMissingTicks(filtered.map(playerPositionRowToPlayerPosition));

  return playerPositions;
}
