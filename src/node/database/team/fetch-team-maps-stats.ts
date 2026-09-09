import { TeamNumber } from 'csdm/common/types/counter-strike';
import type { MapStats } from 'csdm/common/types/map-stats';
import { getFilteredMatchIndexRows, getFilteredTeamMatchIndexRows } from 'csdm/node/store/filter-matches';
import { readMatchDocument } from 'csdm/node/store/match-io';
import { getStore } from 'csdm/node/store/store';
import { roundNumber } from 'csdm/common/math/round-number';
import type { TeamFilters } from './team-filters';

type Acc = {
  mapName: string;
  matchCount: number;
  winCount: number;
  lostCount: number;
  tiedCount: number;
  killCount: number;
  deathCount: number;
  averageDamagesPerRoundSum: number;
  kastSum: number;
  headshotPercentageSum: number;
  playerMatchCount: number;
  roundCount: number;
  roundCountAsCt: number;
  roundCountAsT: number;
  roundWinCount: number;
  roundLostCount: number;
  roundWinCountAsCt: number;
  roundWinCountAsT: number;
};

function emptyAcc(mapName: string): Acc {
  return {
    mapName,
    matchCount: 0,
    winCount: 0,
    lostCount: 0,
    tiedCount: 0,
    killCount: 0,
    deathCount: 0,
    averageDamagesPerRoundSum: 0,
    kastSum: 0,
    headshotPercentageSum: 0,
    playerMatchCount: 0,
    roundCount: 0,
    roundCountAsCt: 0,
    roundCountAsT: 0,
    roundWinCount: 0,
    roundLostCount: 0,
    roundWinCountAsCt: 0,
    roundWinCountAsT: 0,
  };
}

export async function fetchTeamMapsStats(filters: TeamFilters): Promise<MapStats[]> {
  const teamRows = getFilteredTeamMatchIndexRows(filters, filters.name);
  const matches = new Map(getFilteredMatchIndexRows(filters).map((row) => [row.checksum, row]));
  const { playerMatchIndex } = getStore();
  const acc = new Map<string, Acc>();

  for (const team of teamRows) {
    const match = matches.get(team.checksum);
    if (!match) {
      continue;
    }
    const current = acc.get(team.mapName) ?? emptyAcc(team.mapName);
    current.matchCount += 1;
    if (!match.winnerName) {
      current.tiedCount += 1;
    } else if (match.winnerName === filters.name) {
      current.winCount += 1;
    } else {
      current.lostCount += 1;
    }
    acc.set(team.mapName, current);
  }

  for (const player of playerMatchIndex) {
    if (player.teamName !== filters.name) {
      continue;
    }
    if (filters && !matches.has(player.checksum)) {
      continue;
    }
    const current = acc.get(player.mapName);
    if (!current) {
      continue;
    }
    current.killCount += player.killCount;
    current.deathCount += player.deathCount;
    current.averageDamagesPerRoundSum += player.averageDamagePerRound;
    current.kastSum += player.kast;
    current.headshotPercentageSum += player.headshotPercentage;
    current.playerMatchCount += 1;
  }

  for (const team of teamRows) {
    const document = await readMatchDocument(team.checksum);
    if (!document) {
      continue;
    }
    const current = acc.get(team.mapName);
    if (!current) {
      continue;
    }
    for (const round of document.rounds) {
      current.roundCount += 1;
      if (round.winner_side === TeamNumber.T) {
        current.roundCountAsT += 1;
      } else if (round.winner_side === TeamNumber.CT) {
        current.roundCountAsCt += 1;
      }
      if (round.winner_name === filters.name) {
        current.roundWinCount += 1;
        if (round.winner_side === TeamNumber.CT) {
          current.roundWinCountAsCt += 1;
        } else if (round.winner_side === TeamNumber.T) {
          current.roundWinCountAsT += 1;
        }
      } else if (round.winner_name) {
        current.roundLostCount += 1;
      }
    }
  }

  return Array.from(acc.values(), (row) => ({
    mapName: row.mapName,
    matchCount: row.matchCount,
    winCount: row.winCount,
    lostCount: row.lostCount,
    tiedCount: row.tiedCount,
    killDeathRatio: roundNumber(row.killCount / Math.max(row.deathCount, 1), 2),
    averageDamagesPerRound: row.averageDamagesPerRoundSum / Math.max(row.playerMatchCount, 1),
    kast: row.kastSum / Math.max(row.playerMatchCount, 1),
    headshotPercentage: row.headshotPercentageSum / Math.max(row.playerMatchCount, 1),
    roundCount: row.roundCount,
    roundCountAsCt: row.roundCountAsCt,
    roundCountAsT: row.roundCountAsT,
    roundWinCount: row.roundWinCount,
    roundLostCount: row.roundLostCount,
    roundWinCountAsCt: row.roundWinCountAsCt,
    roundWinCountAsT: row.roundWinCountAsT,
  }));
}
