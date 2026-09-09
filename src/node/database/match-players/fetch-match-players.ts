import { fetchCollateralKillCountPerSteamId } from '../player/fetch-collateral-kill-count-per-steam-ids';
import { fetchPlayersClutchStats } from '../players/fetch-players-clutch-stats';
import { fetchPlayersTagIds } from '../tags/fetch-players-tag-ids';
import type { MatchPlayer } from 'csdm/common/types/match-player';
import { readMatchDocument, readMatchEvents } from 'csdm/node/store/match-io';
import type { KillRow } from '../kills/kill-table';
import { getStore } from 'csdm/node/store/store';
import { getOverriddenSteamName } from 'csdm/node/store/steam-name';
import { roundNumber } from 'csdm/common/math/round-number';

export async function fetchMatchPlayers(checksum: string): Promise<MatchPlayer[]> {
  const document = await readMatchDocument(checksum);
  if (!document) {
    return [];
  }

  const { catalogs } = getStore();
  const ignored = new Set(catalogs.ignoredSteamAccounts.map((row) => row.steam_id));
  const kills = await readMatchEvents<KillRow>(checksum, 'kills');
  const matchDate = document.demo.date;

  const rows = document.players.map((player) => {
    const account = catalogs.steamAccounts.find((row) => row.steam_id === player.steam_id);
    const lastBanDate =
      account?.last_ban_date && account.last_ban_date > matchDate && !ignored.has(player.steam_id)
        ? account.last_ban_date
        : null;

    return {
      steamId: player.steam_id,
      name: getOverriddenSteamName(player.steam_id, player.name),
      teamName: player.team_name,
      killCount: player.kill_count,
      assistCount: player.assist_count,
      deathCount: player.death_count,
      bombPlantedCount: player.bomb_planted_count,
      bombDefusedCount: player.bomb_defused_count,
      hostageRescuedCount: player.hostage_rescued_count,
      mvpCount: player.mvp_count,
      headshotCount: player.headshot_count,
      headshotPercentage: player.headshot_percentage,
      oneKillCount: player.one_kill_count,
      twoKillCount: player.two_kill_count,
      threeKillCount: player.three_kill_count,
      fourKillCount: player.four_kill_count,
      fiveKillCount: player.five_kill_count,
      firstKillCount: player.first_kill_count,
      firstDeathCount: player.first_death_count,
      firstTradeKillCount: player.first_trade_kill_count,
      firstTradeDeathCount: player.first_trade_death_count,
      tradeKillCount: player.trade_kill_count,
      tradeDeathCount: player.trade_death_count,
      damageHealth: player.damage_health,
      damageArmor: player.damage_armor,
      utilityDamage: player.utility_damage,
      averageUtilityDamagePerRound: player.utility_damage_per_round,
      kast: player.kast,
      hltvRating: player.hltv_rating,
      hltvRating2: player.hltv_rating_2,
      averageDamagePerRound: player.average_damage_per_round,
      averageKillsPerRound: player.average_kill_per_round,
      averageDeathsPerRound: player.average_death_per_round,
      rankType: player.rank_type,
      oldRank: player.old_rank,
      rank: player.rank,
      winsCount: player.wins_count,
      score: player.score,
      color: player.color,
      crosshairShareCode: player.crosshair_share_code,
      inspectWeaponCount: player.inspect_weapon_count,
      avatar: account?.avatar ?? null,
      last_ban_date: lastBanDate,
      wallbangKillCount: kills.filter(
        (kill) => kill.killer_steam_id === player.steam_id && kill.penetrated_objects > 0,
      ).length,
      noScopeKillCount: kills.filter(
        (kill) => kill.killer_steam_id === player.steam_id && kill.is_no_scope,
      ).length,
      deathWhileInspectingWeaponCount: kills.filter(
        (kill) => kill.victim_steam_id === player.steam_id && kill.is_victim_inspecting_weapon,
      ).length,
    };
  });

  const steamIds = rows.map((row) => row.steamId);
  const [collateralKillCountPerSteamId, playersClutchStats, tagIdsPerSteamId] = await Promise.all([
    fetchCollateralKillCountPerSteamId(checksum),
    fetchPlayersClutchStats([checksum], steamIds),
    fetchPlayersTagIds(steamIds),
  ]);

  return rows.map((row) => {
    const clutchStats = playersClutchStats.find((stats) => stats.clutcherSteamId === row.steamId);
    return {
      ...row,
      killDeathRatio: roundNumber(row.killCount / Math.max(row.deathCount, 1), 2),
      collateralKillCount: collateralKillCountPerSteamId[row.steamId] ?? 0,
      lastBanDate: row.last_ban_date?.toISOString() ?? null,
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
      tagIds: tagIdsPerSteamId[row.steamId] ?? [],
    };
  });
}
