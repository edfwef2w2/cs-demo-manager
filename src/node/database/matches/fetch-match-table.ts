import type { MatchTable } from 'csdm/common/types/match-table';
import { MatchNotFound } from './errors/match-not-found';
import { indexRowToMatchTable } from './fetch-matches-table';
import { getStore } from 'csdm/node/store/store';

export async function fetchMatchTable(checksum: string): Promise<MatchTable> {
  const row = getStore().matchIndex.find((item) => item.checksum === checksum);
  if (row === undefined) {
    throw new MatchNotFound();
  }

  return indexRowToMatchTable(row);
}
