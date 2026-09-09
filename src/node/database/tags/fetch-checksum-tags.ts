import { getStore } from 'csdm/node/store/store';
import type { ChecksumTagRow } from './checksum-tag-table';

export function fetchChecksumTags() {
  const rows: ChecksumTagRow[] = getStore().catalogs.checksumTags;
  return rows;
}
