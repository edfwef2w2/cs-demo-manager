import type { MatchTable } from 'csdm/common/types/match-table';
import type { MatchFilters } from '../match/apply-match-filters';
import { matchPassesFilters } from 'csdm/node/store/filter-matches';
import { getStore } from 'csdm/node/store/store';
import { getBannedPlayerCount } from 'csdm/node/store/steam-name';
import type { MatchIndexRow } from 'csdm/node/store/index-types';

type MatchTableFilters = MatchFilters & { steamId?: string; teamName?: string };

export function indexRowToMatchTable(row: MatchIndexRow): MatchTable {
  const { catalogs, playerMatchIndex } = getStore();
  const comment = catalogs.comments.find((item) => item.checksum === row.checksum)?.comment ?? '';
  const tagIds = catalogs.checksumTags
    .filter((tag) => tag.checksum === row.checksum)
    .map((tag) => String(tag.tag_id));
  const players = playerMatchIndex
    .filter((player) => player.checksum === row.checksum)
    .slice()
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((player) => {
      return { steamId: player.steamId, name: player.name };
    });

  return {
    checksum: row.checksum,
    type: row.type,
    game: row.game,
    analyzeDate: row.analyzeDate,
    assistCount: row.assistCount,
    clientName: row.clientName,
    comment,
    date: row.date,
    players,
    deathCount: row.deathCount,
    killCount: row.killCount,
    collateralKillCount: row.collateralKillCount,
    duration: row.duration,
    demoFilePath: row.demoPath,
    mapName: row.mapName,
    name: row.name,
    serverName: row.serverName,
    source: row.source,
    tickrate: row.tickrate,
    frameRate: row.framerate,
    tickCount: row.tickCount,
    gameMode: row.gameModeStr,
    isRanked: row.isRanked,
    bannedPlayerCount: getBannedPlayerCount(row.date, row.playerSteamIds),
    teamAName: row.teamAName,
    teamAScore: row.teamAScore,
    teamBName: row.teamBName,
    teamBScore: row.teamBScore,
    shareCode: row.shareCode ?? '',
    fiveKillCount: row.fiveKillCount,
    fourKillCount: row.fourKillCount,
    threeKillCount: row.threeKillCount,
    hltvRating2: row.hltvRating2,
    tagIds,
  };
}

export async function fetchMatchesTable(filters: MatchTableFilters): Promise<MatchTable[]> {
  const { matchIndex } = getStore();
  return matchIndex
    .filter((row) => {
      if (!matchPassesFilters(row, filters)) {
        return false;
      }
      if (filters.steamId && !row.playerSteamIds.includes(filters.steamId)) {
        return false;
      }
      if (filters.teamName && !row.teamNames.includes(filters.teamName)) {
        return false;
      }
      return true;
    })
    .map(indexRowToMatchTable);
}
