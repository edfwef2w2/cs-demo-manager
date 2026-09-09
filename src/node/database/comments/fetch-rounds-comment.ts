import { getStore } from 'csdm/node/store/store';

export function fetchRoundsComment(checksum: string) {
  return getStore()
    .catalogs.roundComments.filter((row) => row.match_checksum === checksum)
    .toSorted((left, right) => left.number - right.number);
}
