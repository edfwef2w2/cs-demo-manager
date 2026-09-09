import type { PlayerChartsData } from 'csdm/common/types/charts/player-charts-data';
import { getFilteredPlayerMatchIndexRows } from 'csdm/node/store/filter-matches';
import { readMatchEvents } from 'csdm/node/store/match-io';
import { roundNumber } from 'csdm/common/math/round-number';
import type { MatchFilters } from '../match/apply-match-filters';
import type { ClutchRow } from '../clutches/clutch-table';

export async function fetchPlayerChartsData(steamId: string, filters: MatchFilters): Promise<PlayerChartsData[]> {
  const rows = getFilteredPlayerMatchIndexRows(filters, steamId).toSorted((left, right) =>
    left.date.localeCompare(right.date),
  );

  const data: PlayerChartsData[] = [];
  for (const row of rows) {
    const clutches = (await readMatchEvents<ClutchRow>(row.checksum, 'clutches')).filter(
      (clutch) => clutch.clutcher_steam_id === steamId,
    );
    const wonCount = clutches.filter((clutch) => clutch.won).length;
    data.push({
      headshotPercentage: row.headshotPercentage,
      averageDamagePerRound: row.averageDamagePerRound,
      killDeathRatio: roundNumber(row.killCount / Math.max(row.deathCount, 1), 2),
      clutchWonPercentage: roundNumber((wonCount * 100) / Math.max(clutches.length, 1), 1),
      matchDate: new Date(row.date).toISOString(),
    });
  }

  return data;
}
