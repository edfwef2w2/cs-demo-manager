import type { TeamFilters } from './team-filters';
import { fetchTeamMatchCountStats } from './fetch-team-match-count-stats';
import type { TeamProfile } from 'csdm/common/types/team-profile';
import { TeamNotFound } from './error/team-not-found';
import { fetchMatchesTable } from '../matches/fetch-matches-table';
import { fetchTeamCollateralKillCount } from './fetch-team-collateral-kill-count';
import { fetchTeamRoundCount } from './fetch-team-rounds-count';
import { fetchTeamLastMatches } from './fetch-team-last-matches';
import { fetchTeamClutches } from './fetch-team-clutches';
import { fetchTeamMapsStats } from './fetch-team-maps-stats';
import { fetchTeamEconomyStats } from './fetch-team-economy-stats';
import { fetchTeamMatchSideStats } from './fetch-team-match-side-stats';
import { fetchTeamBombsStats } from './fetch-team-bombs-stats';
import { getFilteredPlayerMatchIndexRows, getFilteredTeamMatchIndexRows } from 'csdm/node/store/filter-matches';
import { readMatchEvents } from 'csdm/node/store/match-io';
import { roundNumber } from 'csdm/common/math/round-number';
import type { KillRow } from '../kills/kill-table';

export async function fetchTeam(filters: TeamFilters): Promise<TeamProfile> {
  const teamRows = getFilteredTeamMatchIndexRows(filters, filters.name);
  if (teamRows.length === 0) {
    throw new TeamNotFound();
  }

  const playerRows = getFilteredPlayerMatchIndexRows(filters).filter((row) => row.teamName === filters.name);
  const matchCount = new Set(teamRows.map((row) => row.checksum)).size;
  const sum = (picker: (row: (typeof playerRows)[number]) => number) =>
    playerRows.reduce((total, row) => total + picker(row), 0);
  const avg = (picker: (row: (typeof playerRows)[number]) => number) =>
    playerRows.length === 0 ? 0 : sum(picker) / playerRows.length;

  const killCount = sum((row) => row.killCount);
  const deathCount = sum((row) => row.deathCount);

  let wallbangKillCount = 0;
  const checksums = [...new Set(teamRows.map((row) => row.checksum))];
  for (const checksum of checksums) {
    const kills = await readMatchEvents<KillRow>(checksum, 'kills');
    wallbangKillCount += kills.filter(
      (kill) => kill.killer_team_name === filters.name && kill.penetrated_objects > 0,
    ).length;
  }

  const [
    matchCountStats,
    lastMatches,
    roundCount,
    matches,
    collateralKillCount,
    clutches,
    maps,
    economyStats,
    sideStats,
    bombsStats,
  ] = await Promise.all([
    fetchTeamMatchCountStats(filters),
    fetchTeamLastMatches(filters.name),
    fetchTeamRoundCount(filters),
    fetchMatchesTable({
      ...filters,
      teamName: filters.name,
    }),
    fetchTeamCollateralKillCount(filters),
    fetchTeamClutches(filters),
    fetchTeamMapsStats(filters),
    fetchTeamEconomyStats(filters),
    fetchTeamMatchSideStats(filters),
    fetchTeamBombsStats(filters),
  ]);

  return {
    name: filters.name,
    matchCount,
    killCount,
    deathCount,
    assistCount: sum((row) => row.assistCount),
    headshotCount: sum((row) => row.headshotCount),
    oneKillCount: sum((row) => row.oneKillCount),
    twoKillCount: sum((row) => row.twoKillCount),
    threeKillCount: sum((row) => row.threeKillCount),
    fourKillCount: sum((row) => row.fourKillCount),
    fiveKillCount: sum((row) => row.fiveKillCount),
    bombPlantedCount: sum((row) => row.bombPlantedCount),
    bombDefusedCount: sum((row) => row.bombDefusedCount),
    headshotPercentage: avg((row) => row.headshotPercentage),
    kast: avg((row) => row.kast),
    killDeathRatio: roundNumber(killCount / Math.max(deathCount, 1), 2),
    hltvRating: avg((row) => row.hltvRating),
    hltvRating2: avg((row) => row.hltvRating2),
    averageDamagePerRound: avg((row) => row.averageDamagePerRound),
    averageKillsPerRound: avg((row) => row.averageKillPerRound),
    averageDeathsPerRound: avg((row) => row.averageDeathPerRound),
    hostageRescuedCount: sum((row) => row.hostageRescuedCount),
    wallbangKillCount,
    ...matchCountStats,
    matches,
    collateralKillCount,
    clutches,
    lastMatches,
    mapsStats: maps,
    roundCount: roundCount.totalCount,
    roundCountAsCt: roundCount.roundCountAsCt,
    roundCountAsT: roundCount.roundCountAsT,
    economyStats,
    sideStats,
    bombsStats,
  };
}
