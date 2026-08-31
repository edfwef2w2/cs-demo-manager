import { uniqueArray } from 'csdm/common/array/unique-array';
import type { ChecksumTagRow } from 'csdm/node/database/tags/checksum-tag-table';
import { updateCatalog } from 'csdm/node/store/store';

export async function updateChecksumsTags(checksums: string[], tagIds: string[]) {
  const uniqueTagIds = uniqueArray(tagIds);
  if (uniqueTagIds.length === 0) {
    return;
  }

  const checksumSet = new Set(checksums);
  const uniqueTagIdSet = new Set(uniqueTagIds);

  await updateCatalog('checksumTags', (current) => {
    const kept = current.filter((row) => {
      if (!checksumSet.has(row.checksum)) {
        return true;
      }

      return uniqueTagIdSet.has(String(row.tag_id));
    });

    const existing = new Set(kept.map((row) => `${row.checksum}:${row.tag_id}`));
    const rows: ChecksumTagRow[] = [...kept];
    for (const checksum of checksums) {
      for (const tagId of uniqueTagIds) {
        const key = `${checksum}:${tagId}`;
        if (!existing.has(key)) {
          rows.push({ checksum, tag_id: tagId });
          existing.add(key);
        }
      }
    }

    return rows;
  });
}
