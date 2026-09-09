import { getStore } from 'csdm/node/store/store';

export async function fetchChecksumTagIds(checksum: string) {
  await Promise.resolve();
  return getStore()
    .catalogs.checksumTags.filter((row) => row.checksum === checksum)
    .map((row) => String(row.tag_id));
}
