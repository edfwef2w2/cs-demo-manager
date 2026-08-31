import { RoundNotFound } from './errors/round-not-found';
import { roundRowToRound } from './round-row-to-round';
import { fetchRoundTags } from '../tags/fetch-round-tags';
import { readMatchDocument } from 'csdm/node/store/match-io';

async function fetchRoundRow(checksum: string, roundNumber: number) {
  const document = await readMatchDocument(checksum);
  const row = document?.rounds.find((round) => round.number === roundNumber);

  if (!row) {
    throw new RoundNotFound();
  }

  return row;
}

export async function fetchRound(checksum: string, roundNumber: number) {
  const [roundRow, tagRows] = await Promise.all([
    fetchRoundRow(checksum, roundNumber),
    fetchRoundTags(checksum, roundNumber),
  ]);

  const tagIds = tagRows.map((tagRow) => tagRow.tag_id);
  const round = roundRowToRound(roundRow, tagIds);

  return round;
}
