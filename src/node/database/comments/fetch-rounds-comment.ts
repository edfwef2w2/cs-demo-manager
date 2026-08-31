import { getStore } from 'csdm/node/store/store';

export async function fetchRoundsComment(checksum: string) {
  return getStore()
    .catalogs.roundComments.filter((row) => row.match_checksum === checksum)
    .slice()
    .sort((left, right) => left.number - right.number);
}
