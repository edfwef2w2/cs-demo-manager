import { CompetitiveRank, type PremierRank } from 'csdm/common/types/counter-strike';
import type { MatchFilters } from '../match/apply-match-filters';
import { PlayerNotFound } from 'csdm/node/errors/player-not-found';
import { getFilteredPlayerMatchIndexRows } from 'csdm/node/store/filter-matches';
import { getStore } from 'csdm/node/store/store';
import { getOverriddenSteamName } from 'csdm/node/store/steam-name';

type LastPlayerData = {
  name: string;
  avatar: string;
  comment: string;
  winsCount: number;
  competitiveRank: CompetitiveRank;
  premierRank: PremierRank;
};

export function fetchLastPlayerData(steamId: string, filters?: MatchFilters): Promise<LastPlayerData> {
  const rows = getFilteredPlayerMatchIndexRows(filters, steamId).toSorted((left, right) =>
    right.date.localeCompare(left.date),
  );
  const player = rows[0];
  if (!player) {
    throw new PlayerNotFound();
  }

  const { catalogs } = getStore();
  const account = catalogs.steamAccounts.find((row) => row.steam_id === steamId);
  const comment = catalogs.playerComments.find((row) => row.steam_id === steamId)?.comment ?? '';
  const lastCompetitive = rows.find(
    (row) => row.rank > CompetitiveRank.Unknown && row.rank <= CompetitiveRank.GlobalElite,
  );
  const lastPremier = rows.find((row) => row.rank > CompetitiveRank.GlobalElite);

  return {
    name: getOverriddenSteamName(steamId, account?.name ?? player.name),
    avatar: account?.avatar ?? '',
    winsCount: player.winsCount,
    comment,
    premierRank: (lastPremier?.rank ?? 0) as PremierRank,
    competitiveRank: (lastCompetitive?.rank ?? 0) as CompetitiveRank,
  };
}
