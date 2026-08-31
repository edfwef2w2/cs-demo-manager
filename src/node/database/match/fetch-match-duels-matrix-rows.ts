import type { DuelMatrixRow } from 'csdm/common/types/duel-matrix-row';
import { readMatchDocument, readMatchEvents } from 'csdm/node/store/match-io';
import type { KillRow } from '../kills/kill-table';
import { getOverriddenSteamName } from 'csdm/node/store/steam-name';

export async function fetchMatchDuelsMatrixRows(checksum: string): Promise<DuelMatrixRow[]> {
  const document = await readMatchDocument(checksum);
  if (!document) {
    return [];
  }
  const kills = await readMatchEvents<KillRow>(checksum, 'kills');
  const rows: DuelMatrixRow[] = [];

  for (const killer of document.players) {
    const killerTeam = document.teams.find((team) => team.name === killer.team_name);
    for (const victim of document.players) {
      if (killer.team_name === victim.team_name) {
        continue;
      }
      const victimTeam = document.teams.find((team) => team.name === victim.team_name);
      const killCount = kills.filter(
        (kill) => kill.killer_steam_id === killer.steam_id && kill.victim_steam_id === victim.steam_id,
      ).length;
      const deathCount = kills.filter(
        (kill) => kill.killer_steam_id === victim.steam_id && kill.victim_steam_id === killer.steam_id,
      ).length;
      rows.push({
        killerSteamId: killer.steam_id,
        killerName: getOverriddenSteamName(killer.steam_id, killer.name),
        killerTeamSide: killerTeam?.current_side ?? 0,
        victimSteamId: victim.steam_id,
        victimName: getOverriddenSteamName(victim.steam_id, victim.name),
        victimTeamSide: victimTeam?.current_side ?? 0,
        killCount,
        deathCount,
      });
    }
  }

  return rows.sort((left, right) => {
    return (
      left.killerName.localeCompare(right.killerName) ||
      left.killerSteamId.localeCompare(right.killerSteamId) ||
      left.victimName.localeCompare(right.victimName) ||
      left.victimSteamId.localeCompare(right.victimSteamId)
    );
  });
}
