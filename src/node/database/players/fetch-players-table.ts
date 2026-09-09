import type { PlayerTable } from 'csdm/common/types/player-table';
import type { PlayersTableFilter } from './players-table-filter';
import { BanFilter } from 'csdm/common/types/ban-filter';
import { fetchPlayersTags } from 'csdm/node/database/tags/fetch-players-tags';
import type { SteamAccountTagTable } from 'csdm/node/database/tags/steam-account-tag-table';
import { fetchLastPlayersData, type LastPlayersData } from './fetch-last-players-data';
import { getStore } from 'csdm/node/store/store';
import { roundNumber } from 'csdm/common/math/round-number';

type PlayersStatsResult = {
  steamId: string;
  killCount: number;
  assistCount: number;
  deathCount: number;
  headshotCount: number;
  mvpCount: number;
  headshotPercentage: number;
  utilityDamage: number;
  averageDamagePerRound: number;
  utilityDamagePerRound: number;
  killDeathRatio: number;
  kast: number;
  matchCount: number;
  threeKillCount: number;
  fourKillCount: number;
  fiveKillCount: number;
  hltvRating: number;
  hltvRating2: number;
  comment: string | null;
};

function playerPassesBanFilter(steamId: string, bans: BanFilter[]) {
  if (bans.length === 0) {
    return true;
  }

  const account = getStore().catalogs.steamAccounts.find((row) => row.steam_id === steamId);
  const vacBanCount = account?.vac_ban_count ?? 0;
  const gameBanCount = account?.game_ban_count ?? 0;
  const isCommunityBanned = account?.is_community_banned ?? false;

  return bans.some((ban) => {
    switch (ban) {
      case BanFilter.None:
        return vacBanCount === 0 && gameBanCount === 0 && !isCommunityBanned;
      case BanFilter.VacBanned:
        return vacBanCount > 0;
      case BanFilter.GameBanned:
        return gameBanCount > 0;
      case BanFilter.CommunityBanned:
        return isCommunityBanned;
      default:
        return false;
    }
  });
}

async function fetchPlayersStats(filter: PlayersTableFilter): Promise<PlayersStatsResult[]> {
  const { playerMatchIndex, catalogs } = getStore();
  const grouped = new Map<string, PlayersStatsResult & { matchCount: number }>();

  for (const row of playerMatchIndex) {
    if (filter.startDate && filter.endDate && (row.date < filter.startDate || row.date > filter.endDate)) {
      continue;
    }

    if (Array.isArray(filter.tagIds) && filter.tagIds.length > 0) {
      const hasTag = catalogs.steamAccountTags.some(
        (tag) => tag.steam_id === row.steamId && filter.tagIds.includes(String(tag.tag_id)),
      );
      if (!hasTag) {
        continue;
      }
    }

    if (!playerPassesBanFilter(row.steamId, filter.bans)) {
      continue;
    }

    const current = grouped.get(row.steamId);
    if (!current) {
      grouped.set(row.steamId, {
        steamId: row.steamId,
        killCount: row.killCount,
        assistCount: row.assistCount,
        deathCount: row.deathCount,
        headshotCount: row.headshotCount,
        mvpCount: row.mvpCount,
        headshotPercentage: row.headshotPercentage,
        utilityDamage: row.utilityDamage,
        averageDamagePerRound: row.averageDamagePerRound,
        utilityDamagePerRound: row.utilityDamagePerRound,
        killDeathRatio: 0,
        kast: row.kast,
        matchCount: 1,
        threeKillCount: row.threeKillCount,
        fourKillCount: row.fourKillCount,
        fiveKillCount: row.fiveKillCount,
        hltvRating: row.hltvRating,
        hltvRating2: row.hltvRating2,
        comment: catalogs.playerComments.find((item) => item.steam_id === row.steamId)?.comment ?? null,
      });
      continue;
    }

    current.killCount += row.killCount;
    current.assistCount += row.assistCount;
    current.deathCount += row.deathCount;
    current.headshotCount += row.headshotCount;
    current.mvpCount += row.mvpCount;
    current.headshotPercentage += row.headshotPercentage;
    current.utilityDamage += row.utilityDamage;
    current.averageDamagePerRound += row.averageDamagePerRound;
    current.utilityDamagePerRound += row.utilityDamagePerRound;
    current.kast += row.kast;
    current.matchCount += 1;
    current.threeKillCount += row.threeKillCount;
    current.fourKillCount += row.fourKillCount;
    current.fiveKillCount += row.fiveKillCount;
    current.hltvRating += row.hltvRating;
    current.hltvRating2 += row.hltvRating2;
  }

  return Array.from(grouped.values(), (row) => {
    const matchCount = Math.max(row.matchCount, 1);
    return {
      ...row,
      headshotPercentage: row.headshotPercentage / matchCount,
      averageDamagePerRound: row.averageDamagePerRound / matchCount,
      utilityDamagePerRound: row.utilityDamagePerRound / matchCount,
      kast: row.kast / matchCount,
      hltvRating: row.hltvRating / matchCount,
      hltvRating2: row.hltvRating2 / matchCount,
      killDeathRatio: roundNumber(row.killCount / Math.max(row.deathCount, 1), 2),
    };
  });
}

function buildPlayersTable(
  playersStats: PlayersStatsResult[],
  lastPlayersData: LastPlayersData[],
  tags: SteamAccountTagTable[],
): PlayerTable[] {
  const players: PlayerTable[] = [];
  for (const playerStats of playersStats) {
    const lastPlayerData = lastPlayersData.find((row) => {
      return row.steamId === playerStats.steamId;
    });
    if (lastPlayerData) {
      players.push({
        ...playerStats,
        name: lastPlayerData.lastKnownName ?? lastPlayerData.name,
        avatar: lastPlayerData.avatar,
        rank: lastPlayerData.rank,
        game: lastPlayerData.game,
        lastBanDate: lastPlayerData.lastBanDate?.toISOString() ?? null,
        lastMatchDate: lastPlayerData.lastMatchDate.toISOString(),
        isVacBanned: lastPlayerData.vacBanCount ? lastPlayerData.vacBanCount > 0 : false,
        isGameBanned: lastPlayerData.gameBanCount ? lastPlayerData.gameBanCount > 0 : false,
        isCommunityBanned: lastPlayerData.isCommunityBanned ?? false,
        comment: playerStats.comment ?? '',
        tagIds: tags
          .filter((row) => {
            return row.steam_id === playerStats.steamId;
          })
          .map((tag) => String(tag.tag_id)),
      });
    } else {
      logger.warn(`Data for player with SteamID ${playerStats.steamId} not found while fetching players`);
    }
  }

  return players;
}

export async function fetchPlayersTable(filter: PlayersTableFilter): Promise<PlayerTable[]> {
  const playersStats = await fetchPlayersStats(filter);
  const steamIds = playersStats.map((player) => player.steamId);
  const [lastPlayersData, tags] = await Promise.all([fetchLastPlayersData(steamIds), fetchPlayersTags()]);
  return buildPlayersTable(playersStats, lastPlayersData, tags);
}
