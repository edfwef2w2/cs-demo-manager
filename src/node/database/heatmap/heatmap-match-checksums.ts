import type { PlayerHeatmapFilter, TeamHeatmapFilter } from 'csdm/common/types/heatmap-filters';
import {
  emptyMatchFilters,
  getFilteredMatchIndexRows,
  getFilteredPlayerMatchIndexRows,
} from 'csdm/node/store/filter-matches';
import type { MatchFilters } from '../match/apply-match-filters';

function toMatchFilters(filters: PlayerHeatmapFilter | TeamHeatmapFilter): MatchFilters {
  return {
    ...emptyMatchFilters(),
    startDate: filters.startDate,
    endDate: filters.endDate,
    demoSources: filters.sources,
    demoTypes: filters.demoTypes,
    games: filters.games,
    gameModes: filters.gameModes,
    tagIds: filters.tagIds,
    maxRounds: filters.maxRounds,
  };
}

export function getPlayerHeatmapChecksums(filters: PlayerHeatmapFilter) {
  return getFilteredPlayerMatchIndexRows(toMatchFilters(filters), filters.steamId)
    .filter((row) => row.mapName === filters.mapName)
    .map((row) => row.checksum);
}

export function getTeamHeatmapChecksums(filters: TeamHeatmapFilter) {
  return getFilteredMatchIndexRows(toMatchFilters(filters))
    .filter((row) => row.mapName === filters.mapName && row.teamNames.includes(filters.teamName))
    .map((row) => row.checksum);
}
