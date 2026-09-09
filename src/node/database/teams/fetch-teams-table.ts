import type { TeamsTableFilter } from './teams-table-filter';
import type { TeamTable } from 'csdm/common/types/team-table';
import { getStore } from 'csdm/node/store/store';
import { roundNumber } from 'csdm/common/math/round-number';

export async function fetchTeamsTable(filter: TeamsTableFilter): Promise<TeamTable[]> {
  const { teamMatchIndex } = getStore();
  const grouped = new Map<
    string,
    TeamTable & {
      matchChecksums: Set<string>;
      hltvRatingTotal: number;
      hltvRating2Total: number;
      kastTotal: number;
      hsTotal: number;
      adrTotal: number;
    }
  >();

  for (const row of teamMatchIndex) {
    if (filter.startDate && filter.endDate && (row.date < filter.startDate || row.date > filter.endDate)) {
      continue;
    }

    const current = grouped.get(row.name);
    if (!current) {
      grouped.set(row.name, {
        name: row.name,
        matchCount: 1,
        killCount: row.killCount,
        deathCount: row.deathCount,
        assistCount: row.assistCount,
        headshotCount: row.headshotCount,
        headshotPercentage: row.headshotPercentage,
        threeKillCount: row.threeKillCount,
        fourKillCount: row.fourKillCount,
        fiveKillCount: row.fiveKillCount,
        kast: row.kast,
        killDeathRatio: 0,
        hltvRating: row.hltvRating,
        hltvRating2: row.hltvRating2,
        averageDamagePerRound: row.averageDamagePerRound,
        lastMatchDate: row.date,
        matchChecksums: new Set([row.checksum]),
        hltvRatingTotal: row.hltvRating,
        hltvRating2Total: row.hltvRating2,
        kastTotal: row.kast,
        hsTotal: row.headshotPercentage,
        adrTotal: row.averageDamagePerRound,
      });
      continue;
    }

    current.matchChecksums.add(row.checksum);
    current.matchCount = current.matchChecksums.size;
    current.killCount += row.killCount;
    current.deathCount += row.deathCount;
    current.assistCount += row.assistCount;
    current.headshotCount += row.headshotCount;
    current.threeKillCount += row.threeKillCount;
    current.fourKillCount += row.fourKillCount;
    current.fiveKillCount += row.fiveKillCount;
    current.hltvRatingTotal += row.hltvRating;
    current.hltvRating2Total += row.hltvRating2;
    current.kastTotal += row.kast;
    current.hsTotal += row.headshotPercentage;
    current.adrTotal += row.averageDamagePerRound;
    if (row.date > current.lastMatchDate) {
      current.lastMatchDate = row.date;
    }
  }

  return [...grouped.values()]
    .map((row) => {
      const matchCount = Math.max(row.matchCount, 1);
      return {
        name: row.name,
        matchCount: row.matchCount,
        killCount: row.killCount,
        deathCount: row.deathCount,
        assistCount: row.assistCount,
        headshotCount: row.headshotCount,
        headshotPercentage: row.hsTotal / matchCount,
        threeKillCount: row.threeKillCount,
        fourKillCount: row.fourKillCount,
        fiveKillCount: row.fiveKillCount,
        kast: row.kastTotal / matchCount,
        killDeathRatio: roundNumber(row.killCount / Math.max(row.deathCount, 1), 2),
        hltvRating: row.hltvRatingTotal / matchCount,
        hltvRating2: row.hltvRating2Total / matchCount,
        averageDamagePerRound: row.adrTotal / matchCount,
        lastMatchDate: row.lastMatchDate,
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}
