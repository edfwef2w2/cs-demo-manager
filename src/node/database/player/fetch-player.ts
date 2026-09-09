import { PlayerNotFound } from '../../errors/player-not-found';
import { fetchPlayerMatchCountStats } from './fetch-player-match-count-stats';
import { fetchPlayerRoundCountStats } from './fetch-player-round-count-stats';
import { fetchLastPlayerData } from './fetch-last-player-data';
import { type MatchFilters } from '../match/apply-match-filters';
import { fetchPlayerCollateralKillCount } from './fetch-player-collateral-kill-count';
import { fetchPlayerUtilityStats } from './fetch-player-utility-stats';
import { fetchPlayerOpeningDuelsStats } from './fetch-player-opening-duels-stats';
import { EconomyBan } from 'csdm/node/steam-web-api/steam-constants';
import type { Player } from 'csdm/common/types/player';
import { getFilteredPlayerMatchIndexRows } from 'csdm/node/store/filter-matches';
import { getStore } from 'csdm/node/store/store';
import { roundNumber } from 'csdm/common/math/round-number';

export async function fetchPlayer(steamId: string, filters?: MatchFilters): Promise<Player> {
  const rows = getFilteredPlayerMatchIndexRows(filters, steamId);
  if (rows.length === 0) {
    throw new PlayerNotFound();
  }

  const account = getStore().catalogs.steamAccounts.find((row) => row.steam_id === steamId);
  const matchCount = rows.length;
  const sum = (picker: (row: (typeof rows)[number]) => number) => rows.reduce((total, row) => total + picker(row), 0);
  const avg = (picker: (row: (typeof rows)[number]) => number) => sum(picker) / matchCount;

  const [lastPlayerData, matchCountStats, roundCount, collateralKillCount, utilitiesStats, openingDuelsStats] =
    await Promise.all([
      fetchLastPlayerData(steamId, filters),
      fetchPlayerMatchCountStats(steamId, filters),
      fetchPlayerRoundCountStats(steamId, filters),
      fetchPlayerCollateralKillCount(steamId, filters),
      fetchPlayerUtilityStats(steamId, filters),
      fetchPlayerOpeningDuelsStats(steamId, filters),
    ]);

  const killCount = sum((row) => row.killCount);
  const deathCount = sum((row) => row.deathCount);

  return {
    ...lastPlayerData,
    ...matchCountStats,
    ...roundCount,
    ...utilitiesStats,
    matchCount,
    roundCount: roundCount.totalCount,
    killCount,
    deathCount,
    assistCount: sum((row) => row.assistCount),
    damageHealth: sum((row) => row.damageHealth),
    damageArmor: sum((row) => row.damageArmor),
    averageDamagePerRound: avg((row) => row.averageDamagePerRound),
    averageKillsPerRound: avg((row) => row.averageKillPerRound),
    averageDeathsPerRound: avg((row) => row.averageDeathPerRound),
    averageUtilityDamagePerRound: roundNumber(avg((row) => row.utilityDamagePerRound), 1),
    headshotCount: sum((row) => row.headshotCount),
    headshotPercentage: avg((row) => row.headshotPercentage),
    mvpCount: sum((row) => row.mvpCount),
    firstKillCount: sum((row) => row.firstKillCount),
    firstDeathCount: sum((row) => row.firstDeathCount),
    bombPlantedCount: sum((row) => row.bombPlantedCount),
    bombDefusedCount: sum((row) => row.bombDefusedCount),
    killDeathRatio: roundNumber(killCount / Math.max(deathCount, 1), 2),
    kast: avg((row) => row.kast),
    utilityDamage: sum((row) => row.utilityDamage),
    tradeKillCount: sum((row) => row.tradeKillCount),
    tradeDeathCount: sum((row) => row.tradeDeathCount),
    firstTradeKillCount: sum((row) => row.firstTradeKillCount),
    firstTradeDeathCount: sum((row) => row.firstTradeDeathCount),
    oneKillCount: sum((row) => row.oneKillCount),
    twoKillCount: sum((row) => row.twoKillCount),
    threeKillCount: sum((row) => row.threeKillCount),
    fourKillCount: sum((row) => row.fourKillCount),
    fiveKillCount: sum((row) => row.fiveKillCount),
    collateralKillCount,
    wallbangKillCount: sum((row) => row.wallbangKillCount),
    hostageRescuedCount: sum((row) => row.hostageRescuedCount),
    hltvRating: avg((row) => row.hltvRating),
    hltvRating2: avg((row) => row.hltvRating2),
    inspectWeaponCount: sum((row) => row.inspectWeaponCount),
    deathWhileInspectingWeaponCount: sum((row) => row.deathWhileInspectingWeaponCount),
    vacBanCount: account?.vac_ban_count ?? 0,
    gameBanCount: account?.game_ban_count ?? 0,
    economyBan: account?.economy_ban ?? EconomyBan.None,
    hasPrivateProfile: account?.has_private_profile ?? false,
    isCommunityBanned: account?.is_community_banned ?? false,
    lastBanDate: account?.last_ban_date?.toISOString() ?? null,
    openingDuelsStats: openingDuelsStats.all,
    steamId,
  };
}
