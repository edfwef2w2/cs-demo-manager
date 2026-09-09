import type { LastMatch } from 'csdm/common/types/last-match';
import { getFilteredMatchIndexRows, getFilteredTeamMatchIndexRows } from 'csdm/node/store/filter-matches';

export async function fetchTeamLastMatches(teamName: string): Promise<LastMatch[]> {
  const teamRows = getFilteredTeamMatchIndexRows(undefined, teamName)
    .toSorted((left, right) => right.date.localeCompare(left.date))
    .slice(0, 8);
  const matches = new Map(getFilteredMatchIndexRows().map((row) => [row.checksum, row]));

  const results: LastMatch[] = [];
  for (const team of teamRows) {
    const match = matches.get(team.checksum);
    if (!match) {
      continue;
    }
    results.push({
      checksum: match.checksum,
      game: match.game,
      mapName: match.mapName,
      winnerName: match.winnerName,
      date: new Date(match.date).toISOString(),
      focusTeamName: teamName,
      scoreTeamA: match.teamAScore,
      scoreTeamB: match.teamBScore,
    });
  }

  return results;
}
