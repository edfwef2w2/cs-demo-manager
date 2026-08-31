import type { Round } from 'csdm/common/types/round';
import { roundRowToRound } from './round-row-to-round';
import { fetchRoundTags } from '../tags/fetch-round-tags';
import { fetchRoundsComment } from '../comments/fetch-rounds-comment';
import { readMatchDocument } from 'csdm/node/store/match-io';

export async function fetchRounds(checksum: string) {
  const document = await readMatchDocument(checksum);
  const roundRows = document?.rounds ?? [];
  const [tagRows, commentRows] = await Promise.all([fetchRoundTags(checksum), fetchRoundsComment(checksum)]);

  const rounds: Round[] = roundRows
    .slice()
    .sort((left, right) => left.number - right.number)
    .map((row) => {
      const tagIds = tagRows.filter((tagRow) => tagRow.round_number === row.number).map((tagRow) => tagRow.tag_id);
      const commentRow = commentRows.find(({ number }) => number === row.number);
      return roundRowToRound(row, tagIds, commentRow?.comment);
    });

  return rounds;
}
