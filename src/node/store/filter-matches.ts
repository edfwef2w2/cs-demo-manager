import { RankingFilter } from 'csdm/common/types/ranking-filter';
import type { MatchFilters } from 'csdm/node/database/match/apply-match-filters';
import type { MatchIndexRow, PlayerMatchIndexRow, TeamMatchIndexRow } from './index-types';
import { getStore } from './store';

type FilterableMatch = {
  checksum: string;
  date: string;
  source: string;
  type: string;
  game: string;
  gameModeStr: string;
  isRanked: boolean;
  maxRounds: number;
};

export function matchPassesFilters(row: FilterableMatch, filters: MatchFilters) {
  if (filters.startDate && filters.endDate) {
    const date = row.date;
    if (date < filters.startDate || date > filters.endDate) {
      return false;
    }
  }

  if (filters.ranking && filters.ranking !== RankingFilter.All) {
    const shouldBeRanked = filters.ranking === RankingFilter.Ranked;
    if (row.isRanked !== shouldBeRanked) {
      return false;
    }
  }

  if (filters.demoSources.length > 0 && !filters.demoSources.includes(row.source as never)) {
    return false;
  }

  if (filters.games.length > 0 && !filters.games.includes(row.game as never)) {
    return false;
  }

  if (filters.demoTypes.length > 0 && !filters.demoTypes.includes(row.type as never)) {
    return false;
  }

  if (filters.gameModes.length > 0 && !filters.gameModes.includes(row.gameModeStr as never)) {
    return false;
  }

  if (filters.maxRounds.length > 0 && !filters.maxRounds.includes(row.maxRounds)) {
    return false;
  }

  if (filters.tagIds.length > 0) {
    const { catalogs } = getStore();
    const hasTag = catalogs.checksumTags.some((tag) => {
      return tag.checksum === row.checksum && filters.tagIds.includes(String(tag.tag_id));
    });
    if (!hasTag) {
      return false;
    }
  }

  return true;
}

export function emptyMatchFilters(): MatchFilters {
  return {
    startDate: undefined,
    endDate: undefined,
    demoSources: [],
    demoTypes: [],
    games: [],
    gameModes: [],
    tagIds: [],
    maxRounds: [],
  };
}

export function getFilteredMatchIndexRows(filters?: MatchFilters) {
  const { matchIndex } = getStore();
  if (!filters) {
    return matchIndex;
  }

  return matchIndex.filter((row: MatchIndexRow) => matchPassesFilters(row, filters));
}

export function getFilteredPlayerMatchIndexRows(filters?: MatchFilters, steamId?: string) {
  const { playerMatchIndex } = getStore();
  return playerMatchIndex.filter((row: PlayerMatchIndexRow) => {
    if (steamId && row.steamId !== steamId) {
      return false;
    }
    if (!filters) {
      return true;
    }
    return matchPassesFilters(row, filters);
  });
}

export function getFilteredTeamMatchIndexRows(filters?: MatchFilters, teamName?: string) {
  const { teamMatchIndex } = getStore();
  return teamMatchIndex.filter((row: TeamMatchIndexRow) => {
    if (teamName && row.name !== teamName) {
      return false;
    }
    if (!filters) {
      return true;
    }
    return matchPassesFilters(row, filters);
  });
}
