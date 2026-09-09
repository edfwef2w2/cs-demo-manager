import { type MatchFilters } from '../match/apply-match-filters';
import { getFilteredMatchIndexRows, getFilteredPlayerMatchIndexRows } from 'csdm/node/store/filter-matches';

type PlayerMatchCountStats = {
  wonMatchCount: number;
  tiedMatchCount: number;
  lostMatchCount: number;
};

export async function fetchPlayerMatchCountStats(
  steamId: string,
  filters?: MatchFilters,
): Promise<PlayerMatchCountStats> {
  await Promise.resolve();
  const playerRows = getFilteredPlayerMatchIndexRows(filters, steamId);
  const matches = new Map(getFilteredMatchIndexRows(filters).map((row) => [row.checksum, row]));

  let wonMatchCount = 0;
  let tiedMatchCount = 0;
  let lostMatchCount = 0;
  for (const player of playerRows) {
    const match = matches.get(player.checksum);
    if (!match) {
      continue;
    }
    if (!match.winnerName) {
      tiedMatchCount += 1;
    } else if (match.winnerName === player.teamName) {
      wonMatchCount += 1;
    } else {
      lostMatchCount += 1;
    }
  }

  return { wonMatchCount, tiedMatchCount, lostMatchCount };
}
