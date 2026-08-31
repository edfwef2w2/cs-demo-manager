import { readMatchEvents } from 'csdm/node/store/match-io';
import { getStore } from 'csdm/node/store/store';
import type { ClutchRow } from '../clutches/clutch-table';

export type PlayerClutchStats = {
  clutcherSteamId: string;
  totalCount: number;
  vsOneCount: number;
  vsOneWonCount: number;
  vsOneLostCount: number;
  vsTwoCount: number;
  vsTwoWonCount: number;
  vsTwoLostCount: number;
  vsThreeCount: number;
  vsThreeWonCount: number;
  vsThreeLostCount: number;
  vsFourCount: number;
  vsFourWonCount: number;
  vsFourLostCount: number;
  vsFiveCount: number;
  vsFiveWonCount: number;
  vsFiveLostCount: number;
};

function emptyStats(steamId: string): PlayerClutchStats {
  return {
    clutcherSteamId: steamId,
    totalCount: 0,
    vsOneCount: 0,
    vsOneWonCount: 0,
    vsOneLostCount: 0,
    vsTwoCount: 0,
    vsTwoWonCount: 0,
    vsTwoLostCount: 0,
    vsThreeCount: 0,
    vsThreeWonCount: 0,
    vsThreeLostCount: 0,
    vsFourCount: 0,
    vsFourWonCount: 0,
    vsFourLostCount: 0,
    vsFiveCount: 0,
    vsFiveWonCount: 0,
    vsFiveLostCount: 0,
  };
}

export async function fetchPlayersClutchStats(checksums: string[], steamIds: string[]): Promise<PlayerClutchStats[]> {
  const targetChecksums = checksums.length > 0 ? checksums : getStore().matchIndex.map((row) => row.checksum);
  const steamIdSet = steamIds.length > 0 ? new Set(steamIds) : undefined;
  const stats = new Map<string, PlayerClutchStats>();

  for (const checksum of targetChecksums) {
    const clutches = await readMatchEvents<ClutchRow>(checksum, 'clutches');
    for (const clutch of clutches) {
      if (steamIdSet && !steamIdSet.has(clutch.clutcher_steam_id)) {
        continue;
      }
      const current = stats.get(clutch.clutcher_steam_id) ?? emptyStats(clutch.clutcher_steam_id);
      current.totalCount += 1;
      const countKey = (
        {
          1: 'vsOneCount',
          2: 'vsTwoCount',
          3: 'vsThreeCount',
          4: 'vsFourCount',
          5: 'vsFiveCount',
        } as const
      )[clutch.opponent_count];
      const wonKey = (
        {
          1: 'vsOneWonCount',
          2: 'vsTwoWonCount',
          3: 'vsThreeWonCount',
          4: 'vsFourWonCount',
          5: 'vsFiveWonCount',
        } as const
      )[clutch.opponent_count];
      const lostKey = (
        {
          1: 'vsOneLostCount',
          2: 'vsTwoLostCount',
          3: 'vsThreeLostCount',
          4: 'vsFourLostCount',
          5: 'vsFiveLostCount',
        } as const
      )[clutch.opponent_count];
      if (countKey) {
        current[countKey] += 1;
        if (clutch.won) {
          current[wonKey] += 1;
        } else {
          current[lostKey] += 1;
        }
      }
      stats.set(clutch.clutcher_steam_id, current);
    }
  }

  return [...stats.values()].sort((left, right) => left.clutcherSteamId.localeCompare(right.clutcherSteamId));
}
