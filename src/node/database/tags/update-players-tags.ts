import { uniqueArray } from 'csdm/common/array/unique-array';
import { updateCatalog } from 'csdm/node/store/store';

export async function updatePlayersTags(steamIds: string[], tagIds: string[]) {
  const uniqueTagIds = uniqueArray(tagIds);
  if (uniqueTagIds.length === 0) {
    return;
  }

  const steamIdSet = new Set(steamIds);
  const uniqueTagIdSet = new Set(uniqueTagIds);

  await updateCatalog('steamAccountTags', (current) => {
    const kept = current.filter((row) => {
      if (!steamIdSet.has(row.steam_id)) {
        return true;
      }
      return uniqueTagIdSet.has(String(row.tag_id));
    });

    const existing = new Set(kept.map((row) => `${row.steam_id}:${row.tag_id}`));
    const next = [...kept];
    for (const steamId of steamIds) {
      for (const tagId of uniqueTagIds) {
        const key = `${steamId}:${tagId}`;
        if (!existing.has(key)) {
          next.push({ steam_id: steamId, tag_id: tagId });
          existing.add(key);
        }
      }
    }
    return next;
  });
}
