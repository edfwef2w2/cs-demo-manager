import type { MatchTablePlayer } from 'csdm/common/types/match-table';
import { getStore } from 'csdm/node/store/store';
import { getOverriddenSteamName } from 'csdm/node/store/steam-name';

export async function fetchPlayersPerMatch(checksums: string[]): Promise<Record<string, MatchTablePlayer[]>> {
  const checksumSet = new Set(checksums);
  const { playerMatchIndex } = getStore();
  const playersPerMatch: Record<string, MatchTablePlayer[]> = {};

  const rows = playerMatchIndex
    .filter((row) => checksumSet.has(row.checksum))
    .slice()
    .sort((left, right) => left.name.localeCompare(right.name));

  for (const row of rows) {
    if (!playersPerMatch[row.checksum]) {
      playersPerMatch[row.checksum] = [];
    }
    playersPerMatch[row.checksum].push({
      steamId: row.steamId,
      name: getOverriddenSteamName(row.steamId, row.name),
    });
  }

  return playersPerMatch;
}
