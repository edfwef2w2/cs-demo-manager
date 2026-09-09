import type { TeamBombsStats } from 'csdm/common/types/team-bombs-stats';
import type { MatchBombsDocument } from 'csdm/node/store/match-document';
import { getFilteredTeamMatchIndexRows } from 'csdm/node/store/filter-matches';
import { readMatchDocument, readMatchJson } from 'csdm/node/store/match-io';
import { getStore } from 'csdm/node/store/store';
import type { BombPlantedTable } from '../bomb-planted/bomb-planted-table';
import type { BombDefusedTable } from '../bomb-defused/bomb-defused-table';
import type { BombExplodedTable } from '../bomb-exploded/bomb-exploded-table';
import type { TeamFilters } from './team-filters';

export async function fetchTeamBombsStats(filters: TeamFilters): Promise<TeamBombsStats> {
  const teamName = filters.name;
  const checksums = getFilteredTeamMatchIndexRows(filters, teamName).map((row) => row.checksum);
  const { playerMatchIndex } = getStore();

  let plantCount = 0;
  let plantCountSiteA = 0;
  let plantCountSiteB = 0;
  let roundsWonDueToBombExplosion = 0;
  let roundsWonDueToDefusal = 0;
  let roundsLostDueToBombExplosion = 0;
  let roundsLostDueToDefusal = 0;
  let roundsWonByPlayerDeaths = 0;
  let roundsLostDueToPlayerDeaths = 0;

  for (const checksum of checksums) {
    const [document, bombs] = await Promise.all([
      readMatchDocument(checksum),
      readMatchJson<MatchBombsDocument>(checksum, 'bombs'),
    ]);
    if (!document) {
      continue;
    }

    const planted = (bombs?.planted ?? []) as BombPlantedTable[];
    const defused = (bombs?.defused ?? []) as BombDefusedTable[];
    const exploded = (bombs?.exploded ?? []) as BombExplodedTable[];

    const teamSteamIds = new Set(
      playerMatchIndex
        .filter((row) => row.checksum === checksum && row.teamName === teamName)
        .map((row) => row.steamId),
    );
    const enemySteamIds = new Set(
      playerMatchIndex
        .filter((row) => row.checksum === checksum && row.teamName !== teamName)
        .map((row) => row.steamId),
    );

    const teamPlants = planted.filter((plant) => teamSteamIds.has(plant.planter_steam_id));
    const enemyPlants = planted.filter((plant) => enemySteamIds.has(plant.planter_steam_id));
    plantCount += teamPlants.length;
    plantCountSiteA += teamPlants.filter((plant) => plant.site === 'A').length;
    plantCountSiteB += teamPlants.filter((plant) => plant.site === 'B').length;

    const explodedRounds = new Set(exploded.map((row) => row.round_number));
    const defusedRounds = new Set(defused.map((row) => row.round_number));
    const teamPlantRounds = new Set(teamPlants.map((row) => row.round_number));
    const enemyPlantRounds = new Set(enemyPlants.map((row) => row.round_number));

    for (const round of document.rounds) {
      const won = round.winner_name === teamName;
      const lost = !!round.winner_name && round.winner_name !== teamName;
      if (won && explodedRounds.has(round.number)) {
        roundsWonDueToBombExplosion += 1;
      }
      if (won && defusedRounds.has(round.number)) {
        roundsWonDueToDefusal += 1;
      }
      if (lost && explodedRounds.has(round.number)) {
        roundsLostDueToBombExplosion += 1;
      }
      if (lost && defusedRounds.has(round.number)) {
        roundsLostDueToDefusal += 1;
      }
      if (
        won &&
        teamPlantRounds.has(round.number) &&
        !explodedRounds.has(round.number) &&
        !defusedRounds.has(round.number)
      ) {
        roundsWonByPlayerDeaths += 1;
      }
      if (
        lost &&
        enemyPlantRounds.has(round.number) &&
        !explodedRounds.has(round.number) &&
        !defusedRounds.has(round.number)
      ) {
        roundsLostDueToPlayerDeaths += 1;
      }
    }
  }

  return {
    plantCount,
    plantCountSiteA,
    plantCountSiteB,
    roundsWonDueToBombExplosion,
    roundsWonDueToDefusal,
    roundsLostDueToBombExplosion,
    roundsLostDueToDefusal,
    roundsWonByPlayerDeaths,
    roundsLostDueToPlayerDeaths,
  };
}
