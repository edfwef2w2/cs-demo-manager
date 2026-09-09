import { TeamNumber } from 'csdm/common/types/counter-strike';
import { getFilteredMatchIndexRows, getFilteredPlayerMatchIndexRows } from 'csdm/node/store/filter-matches';
import { readMatchDocument } from 'csdm/node/store/match-io';
import { roundNumber } from 'csdm/common/math/round-number';
import type { MatchFilters } from '../match/apply-match-filters';
import type { PlayerMapsStats } from 'csdm/common/types/map-stats';

type Acc = {
  steamId: string;
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
  roundCount: number;
  roundCountAsCt: number;
  roundCountAsT: number;
  roundWinCount: number;
  roundLostCount: number;
  roundWinCountAsCt: number;
  roundWinCountAsT: number;
};

function keyOf(steamId: string, mapName: string) {
  return `${steamId}::${mapName}`;
}

function emptyAcc(steamId: string, mapName: string): Acc {
  return {
    steamId,
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
    roundCount: 0,
    roundCountAsCt: 0,
    roundCountAsT: 0,
    roundWinCount: 0,
    roundLostCount: 0,
    roundWinCountAsCt: 0,
    roundWinCountAsT: 0,
  };
}

export async function fetchPlayersMapsStats(steamIds: string[], filters?: MatchFilters): Promise<PlayerMapsStats[]> {
  const steamIdSet = new Set(steamIds);
  const playerRows = getFilteredPlayerMatchIndexRows(filters).filter((row) => steamIdSet.has(row.steamId));
  const matches = new Map(getFilteredMatchIndexRows(filters).map((row) => [row.checksum, row]));
  const acc = new Map<string, Acc>();

  for (const player of playerRows) {
    const match = matches.get(player.checksum);
    if (!match) {
      continue;
    }
    const key = keyOf(player.steamId, player.mapName);
    const current = acc.get(key) ?? emptyAcc(player.steamId, player.mapName);
    current.matchCount += 1;
    current.killCount += player.killCount;
    current.deathCount += player.deathCount;
    current.averageDamagesPerRoundSum += player.averageDamagePerRound;
    current.kastSum += player.kast;
    current.headshotPercentageSum += player.headshotPercentage;
    if (!match.winnerName) {
      current.tiedCount += 1;
    } else if (match.winnerName === player.teamName) {
      current.winCount += 1;
    } else {
      current.lostCount += 1;
    }
    acc.set(key, current);
  }

  const playersByChecksum = new Map<string, Array<{ steamId: string; teamName: string; mapName: string }>>();
  for (const player of playerRows) {
    const current = playersByChecksum.get(player.checksum) ?? [];
    current.push({ steamId: player.steamId, teamName: player.teamName, mapName: player.mapName });
    playersByChecksum.set(player.checksum, current);
  }

  for (const [checksum, players] of playersByChecksum) {
    const document = await readMatchDocument(checksum);
    if (!document) {
      continue;
    }
    for (const round of document.rounds) {
      for (const player of players) {
        const key = keyOf(player.steamId, player.mapName);
        const current = acc.get(key);
        if (!current) {
          continue;
        }
        current.roundCount += 1;
        if (round.winner_side === TeamNumber.T) {
          current.roundCountAsT += 1;
        } else if (round.winner_side === TeamNumber.CT) {
          current.roundCountAsCt += 1;
        }
        if (round.winner_name === player.teamName) {
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
  }

  return acc
    .values()
    .toSorted((left, right) => left.steamId.localeCompare(right.steamId) || left.mapName.localeCompare(right.mapName))
    .map((row) => ({
      steamId: row.steamId,
      mapName: row.mapName,
      matchCount: row.matchCount,
      winCount: row.winCount,
      lostCount: row.lostCount,
      tiedCount: row.tiedCount,
      killDeathRatio: roundNumber(row.killCount / Math.max(row.deathCount, 1), 2),
      averageDamagesPerRound: row.averageDamagesPerRoundSum / Math.max(row.matchCount, 1),
      kast: row.kastSum / Math.max(row.matchCount, 1),
      headshotPercentage: row.headshotPercentageSum / Math.max(row.matchCount, 1),
      roundCount: row.roundCount,
      roundCountAsCt: row.roundCountAsCt,
      roundCountAsT: row.roundCountAsT,
      roundWinCount: row.roundWinCount,
      roundLostCount: row.roundLostCount,
      roundWinCountAsCt: row.roundWinCountAsCt,
      roundWinCountAsT: row.roundWinCountAsT,
    }));
}
