import type { DemoSource, DemoType, Game, GameMode } from 'csdm/common/types/counter-strike';
import { RankingFilter } from 'csdm/common/types/ranking-filter';
import { matchPassesFilters } from 'csdm/node/store/filter-matches';

export type MatchFilters = {
  startDate: string | undefined;
  endDate: string | undefined;
  demoSources: DemoSource[];
  demoTypes: DemoType[];
  games: Game[];
  ranking?: RankingFilter;
  gameModes: GameMode[];
  tagIds: string[];
  maxRounds: number[];
};

export { matchPassesFilters as applyMatchFilters };
