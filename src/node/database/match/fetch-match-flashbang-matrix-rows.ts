import type { FlashbangMatrixRow } from 'csdm/common/types/flashbang-matrix-row';
import { readMatchDocument, readMatchEvents } from 'csdm/node/store/match-io';
import { getOverriddenSteamName } from 'csdm/node/store/steam-name';
import { roundNumber } from 'csdm/common/math/round-number';
import type { PlayerBlindTable } from '../player-blinds/player-blind-table';

export async function fetchMatchFlashbangMatrixRows(checksum: string): Promise<FlashbangMatrixRow[]> {
  const document = await readMatchDocument(checksum);
  if (!document) {
    return [];
  }

  const blinds = await readMatchEvents<PlayerBlindTable>(checksum, 'blinds');
  const teamSideByName = new Map(document.teams.map((team) => [team.name, team.current_side]));
  const players = document.players.toSorted(
    (left, right) =>
      left.team_name.localeCompare(right.team_name) ||
      getOverriddenSteamName(left.steam_id, left.name).localeCompare(
        getOverriddenSteamName(right.steam_id, right.name),
      ) ||
      left.steam_id.localeCompare(right.steam_id),
  );

  const result: FlashbangMatrixRow[] = [];
  for (const flasher of players) {
    for (const flashed of players) {
      const durations = blinds
        .filter((blind) => blind.flasher_steam_id === flasher.steam_id && blind.flashed_steam_id === flashed.steam_id)
        .map((blind) => blind.duration);
      const duration =
        durations.length === 0
          ? 0
          : roundNumber(durations.reduce((sum, value) => sum + value, 0) / durations.length, 2);
      result.push({
        flasherSteamId: flasher.steam_id,
        flasherName: getOverriddenSteamName(flasher.steam_id, flasher.name),
        flasherTeamSide: teamSideByName.get(flasher.team_name)!,
        flashedSteamId: flashed.steam_id,
        flashedName: getOverriddenSteamName(flashed.steam_id, flashed.name),
        flashedTeamSide: teamSideByName.get(flashed.team_name)!,
        duration,
      });
    }
  }

  return result;
}
