import { getStore } from 'csdm/node/store/store';
import type { ChecksumTagRow } from './checksum-tag-table';

export async function fetchChecksumTags() {
  await Promise.resolve();
  const rows: ChecksumTagRow[] = getStore().catalogs.checksumTags;
  return rows;
}
