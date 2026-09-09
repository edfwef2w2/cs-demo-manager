import { TeamNumber } from 'csdm/common/types/counter-strike';
import { getFilteredPlayerMatchIndexRows } from 'csdm/node/store/filter-matches';
import { readMatchDocument } from 'csdm/node/store/match-io';
import type { MatchFilters } from '../match/apply-match-filters';

export type PlayerRoundCountStats = {
  steamId: string;
  totalCount: number;
  roundCountAsCt: number;
  roundCountAsT: number;
};

export async function fetchPlayersRoundCountStats(
  steamIds: string[],
  filters?: MatchFilters,
): Promise<PlayerRoundCountStats[]> {
  const steamIdSet = new Set(steamIds);
  const playerRows = getFilteredPlayerMatchIndexRows(filters).filter((row) => steamIdSet.has(row.steamId));
  const playersByChecksum = new Map<string, Array<{ steamId: string; teamName: string }>>();
  for (const row of playerRows) {
    const current = playersByChecksum.get(row.checksum) ?? [];
    current.push({ steamId: row.steamId, teamName: row.teamName });
    playersByChecksum.set(row.checksum, current);
  }

  const stats = new Map<string, PlayerRoundCountStats>();
  for (const steamId of steamIds) {
    stats.set(steamId, {
      steamId,
      totalCount: 0,
      roundCountAsCt: 0,
      roundCountAsT: 0,
    });
  }

  for (const [checksum, players] of playersByChecksum) {
    const document = await readMatchDocument(checksum);
    if (!document) {
      continue;
    }
    for (const round of document.rounds) {
      for (const player of players) {
        const current = stats.get(player.steamId);
        if (!current) {
          continue;
        }
        current.totalCount += 1;
        const isTeamA = round.team_a_name === player.teamName;
        const isTeamB = round.team_b_name === player.teamName;
        if ((isTeamA && round.team_a_side === TeamNumber.CT) || (isTeamB && round.team_b_side === TeamNumber.CT)) {
          current.roundCountAsCt += 1;
        }
        if ((isTeamA && round.team_a_side === TeamNumber.T) || (isTeamB && round.team_b_side === TeamNumber.T)) {
          current.roundCountAsT += 1;
        }
      }
    }
  }

  return steamIds
    .toSorted()
    .map((steamId) => stats.get(steamId)!);
}
