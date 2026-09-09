import { getStore } from 'csdm/node/store/store';

export async function fetchRoundsComment(checksum: string) {
  await Promise.resolve();
  return getStore()
    .catalogs.roundComments.filter((row) => row.match_checksum === checksum)
    .toSorted((left, right) => left.number - right.number);
}
