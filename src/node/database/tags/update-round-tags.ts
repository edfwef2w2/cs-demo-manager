import { uniqueArray } from 'csdm/common/array/unique-array';
import { updateCatalog } from 'csdm/node/store/store';

export async function updateRoundTags(checksum: string, roundNumber: number, tagIds: string[]) {
  const uniqueTagIds = uniqueArray(tagIds);
  if (uniqueTagIds.length === 0) {
    return;
  }

  const uniqueTagIdSet = new Set(uniqueTagIds);
  await updateCatalog('roundTags', (current) => {
    const kept = current.filter((row) => {
      if (row.checksum !== checksum || row.round_number !== roundNumber) {
        return true;
      }
      return uniqueTagIdSet.has(String(row.tag_id));
    });

    const existing = new Set(
      kept
        .filter((row) => row.checksum === checksum && row.round_number === roundNumber)
        .map((row) => String(row.tag_id)),
    );

    const next = [...kept];
    for (const tagId of uniqueTagIds) {
      if (!existing.has(tagId)) {
        next.push({ checksum, round_number: roundNumber, tag_id: tagId });
      }
    }
    return next;
  });
}
