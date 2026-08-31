import type { Rank } from 'csdm/common/types/counter-strike';
import { fetchPlayersClutchStats } from '../players/fetch-players-clutch-stats';
import { fetchLastPlayersData } from '../players/fetch-last-players-data';
import { fetchPlayersWeaponInspectionsStats } from '../players/fetch-players-weapon-inspections-stats';
import { fetchPlayersEnemiesFlashedCount } from '../players/fetch-players-enemies-flashed-count';
import { getStore } from 'csdm/node/store/store';
import { roundNumber } from 'csdm/common/math/round-number';

type PlayerQueryResult = {
  steamId: string;
  teamName: string;
  matchCount: number;
  killCount: number;
  assistCount: number;
  deathCount: number;
  killDeathRatio: number;
  headshotCount: number;
  headshotPercentage: number;
  hltvRating: number;
  hltvRating2: number;
  kast: number;
  damageHealth: number;
  damageArmor: number;
  firstKillCount: number;
  firstDeathCount: number;
  averageDamagePerRound: number;
  averageKillsPerRound: number;
  averageDeathsPerRound: number;
  oneKillCount: number;
  twoKillCount: number;
  threeKillCount: number;
  fourKillCount: number;
  fiveKillCount: number;
  vsOneCount: number;
  vsTwoCount: number;
  vsThreeCount: number;
  vsFourCount: number;
  vsFiveCount: number;
  vsOneWonCount: number;
  vsTwoWonCount: number;
  vsThreeWonCount: number;
  vsFourWonCount: number;
  vsFiveWonCount: number;
  vsOneLostCount: number;
  vsTwoLostCount: number;
  vsThreeLostCount: number;
  vsFourLostCount: number;
  vsFiveLostCount: number;
  bombPlantedCount: number;
  bombDefusedCount: number;
  hostageRescuedCount: number;
  utilityDamage: number;
  averageUtilityDamagePerRound: number;
  enemiesFlashedCount: number;
  score: number;
  mvpCount: number;
  gameBanCount: number;
  isCommunityBanned: boolean;
  vacBanCount: number;
  lastBanDate: string | null;
  inspectWeaponCount: number;
  deathWhileInspectingWeaponCount: number;
};

export type PlayerRow = PlayerQueryResult & {
  name: string;
  rank: Rank;
  winsCount: number;
};

type Filters = {
  checksums?: string[];
  steamIds?: string[];
};

export async function fetchPlayersRows(filters: Filters): Promise<PlayerRow[]> {
  const checksums = filters.checksums ?? [];
  const filterSteamIds = filters.steamIds ?? [];
  const checksumSet = checksums.length > 0 ? new Set(checksums) : undefined;
  const steamIdSet = filterSteamIds.length > 0 ? new Set(filterSteamIds) : undefined;
  const grouped = new Map<string, PlayerQueryResult>();

  for (const row of getStore().playerMatchIndex) {
    if (checksumSet && !checksumSet.has(row.checksum)) {
      continue;
    }
    if (steamIdSet && !steamIdSet.has(row.steamId)) {
      continue;
    }
    const current = grouped.get(row.steamId);
    if (!current) {
      grouped.set(row.steamId, {
        steamId: row.steamId,
        teamName: checksums.length > 0 ? row.teamName : '',
        matchCount: 1,
        killCount: row.killCount,
        assistCount: row.assistCount,
        deathCount: row.deathCount,
        killDeathRatio: 0,
        headshotCount: row.headshotCount,
        headshotPercentage: row.headshotPercentage,
        hltvRating: row.hltvRating,
        hltvRating2: row.hltvRating2,
        kast: row.kast,
        damageHealth: row.damageHealth,
        damageArmor: row.damageArmor,
        firstKillCount: row.firstKillCount,
        firstDeathCount: row.firstDeathCount,
        averageDamagePerRound: row.averageDamagePerRound,
        averageKillsPerRound: row.averageKillPerRound,
        averageDeathsPerRound: row.averageDeathPerRound,
        oneKillCount: row.oneKillCount,
        twoKillCount: row.twoKillCount,
        threeKillCount: row.threeKillCount,
        fourKillCount: row.fourKillCount,
        fiveKillCount: row.fiveKillCount,
        vsOneCount: 0,
        vsTwoCount: 0,
        vsThreeCount: 0,
        vsFourCount: 0,
        vsFiveCount: 0,
        vsOneWonCount: 0,
        vsTwoWonCount: 0,
        vsThreeWonCount: 0,
        vsFourWonCount: 0,
        vsFiveWonCount: 0,
        vsOneLostCount: 0,
        vsTwoLostCount: 0,
        vsThreeLostCount: 0,
        vsFourLostCount: 0,
        vsFiveLostCount: 0,
        bombPlantedCount: row.bombPlantedCount,
        bombDefusedCount: row.bombDefusedCount,
        hostageRescuedCount: row.hostageRescuedCount,
        utilityDamage: row.utilityDamage,
        averageUtilityDamagePerRound: row.utilityDamagePerRound,
        enemiesFlashedCount: 0,
        score: row.score,
        mvpCount: row.mvpCount,
        gameBanCount: 0,
        isCommunityBanned: false,
        vacBanCount: 0,
        lastBanDate: null,
        inspectWeaponCount: row.inspectWeaponCount,
        deathWhileInspectingWeaponCount: 0,
      });
      continue;
    }
    current.matchCount += 1;
    current.killCount += row.killCount;
    current.assistCount += row.assistCount;
    current.deathCount += row.deathCount;
    current.headshotCount += row.headshotCount;
    current.headshotPercentage += row.headshotPercentage;
    current.hltvRating += row.hltvRating;
    current.hltvRating2 += row.hltvRating2;
    current.kast += row.kast;
    current.damageHealth += row.damageHealth;
    current.damageArmor += row.damageArmor;
    current.firstKillCount += row.firstKillCount;
    current.firstDeathCount += row.firstDeathCount;
    current.averageDamagePerRound += row.averageDamagePerRound;
    current.averageKillsPerRound += row.averageKillPerRound;
    current.averageDeathsPerRound += row.averageDeathPerRound;
    current.oneKillCount += row.oneKillCount;
    current.twoKillCount += row.twoKillCount;
    current.threeKillCount += row.threeKillCount;
    current.fourKillCount += row.fourKillCount;
    current.fiveKillCount += row.fiveKillCount;
    current.bombPlantedCount += row.bombPlantedCount;
    current.bombDefusedCount += row.bombDefusedCount;
    current.hostageRescuedCount += row.hostageRescuedCount;
    current.utilityDamage += row.utilityDamage;
    current.averageUtilityDamagePerRound += row.utilityDamagePerRound;
    current.score += row.score;
    current.mvpCount += row.mvpCount;
    current.inspectWeaponCount += row.inspectWeaponCount;
  }

  const players = [...grouped.values()].map((row) => {
    const matchCount = Math.max(row.matchCount, 1);
    return {
      ...row,
      headshotPercentage: row.headshotPercentage / matchCount,
      hltvRating: row.hltvRating / matchCount,
      hltvRating2: row.hltvRating2 / matchCount,
      kast: row.kast / matchCount,
      averageDamagePerRound: row.averageDamagePerRound / matchCount,
      averageKillsPerRound: row.averageKillsPerRound / matchCount,
      averageDeathsPerRound: row.averageDeathsPerRound / matchCount,
      averageUtilityDamagePerRound: roundNumber(row.averageUtilityDamagePerRound / matchCount, 1),
      killDeathRatio: roundNumber(row.killCount / Math.max(row.deathCount, 1), 1),
    };
  });

  const steamIds = players.map((player) => player.steamId);
  const [lastPlayersData, playersClutchStats, playersWeaponInspectionsStats, playersEnemiesFlashedCount] =
    await Promise.all([
      fetchLastPlayersData(steamIds),
      fetchPlayersClutchStats(checksums, steamIds),
      fetchPlayersWeaponInspectionsStats(checksums, steamIds),
      fetchPlayersEnemiesFlashedCount({ checksums, steamIds }),
    ]);

  return players.map((player) => {
    const lastData = lastPlayersData.find((data) => data.steamId === player.steamId);
    const clutchStats = playersClutchStats.find((stats) => stats.clutcherSteamId === player.steamId);
    if (!lastData) {
      throw new Error(`Last player data not found for steamId: ${player.steamId}`);
    }
    const weaponInspectionsStats = playersWeaponInspectionsStats.find((stats) => stats.steamId === player.steamId);
    const enemiesFlashed = playersEnemiesFlashedCount.find((stats) => stats.steamId === player.steamId);

    return {
      ...player,
      ...lastData,
      teamName: player.teamName,
      inspectWeaponCount: player.inspectWeaponCount ?? 0,
      deathWhileInspectingWeaponCount: weaponInspectionsStats?.deathWhileInspectingWeaponCount ?? 0,
      enemiesFlashedCount: enemiesFlashed?.enemiesFlashedCount ?? 0,
      gameBanCount: lastData.gameBanCount ?? 0,
      isCommunityBanned: lastData.isCommunityBanned ?? false,
      vacBanCount: lastData.vacBanCount ?? 0,
      lastBanDate: lastData.lastBanDate?.toISOString() ?? null,
      vsOneCount: clutchStats?.vsOneCount ?? 0,
      vsOneWonCount: clutchStats?.vsOneWonCount ?? 0,
      vsOneLostCount: clutchStats?.vsOneLostCount ?? 0,
      vsTwoCount: clutchStats?.vsTwoCount ?? 0,
      vsTwoWonCount: clutchStats?.vsTwoWonCount ?? 0,
      vsTwoLostCount: clutchStats?.vsTwoLostCount ?? 0,
      vsThreeCount: clutchStats?.vsThreeCount ?? 0,
      vsThreeWonCount: clutchStats?.vsThreeWonCount ?? 0,
      vsThreeLostCount: clutchStats?.vsThreeLostCount ?? 0,
      vsFourCount: clutchStats?.vsFourCount ?? 0,
      vsFourWonCount: clutchStats?.vsFourWonCount ?? 0,
      vsFourLostCount: clutchStats?.vsFourLostCount ?? 0,
      vsFiveCount: clutchStats?.vsFiveCount ?? 0,
      vsFiveWonCount: clutchStats?.vsFiveWonCount ?? 0,
      vsFiveLostCount: clutchStats?.vsFiveLostCount ?? 0,
    };
  });
}
