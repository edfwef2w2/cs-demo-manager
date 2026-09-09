import { getStore } from 'csdm/node/store/store';

export function fetchChecksumTagIds(checksum: string) {
  return getStore()
    .catalogs.checksumTags.filter((row) => row.checksum === checksum)
    .map((row) => String(row.tag_id));
}
