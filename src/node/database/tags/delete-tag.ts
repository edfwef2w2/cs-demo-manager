import { updateCatalog } from 'csdm/node/store/store';

export async function deleteTag(tagId: string) {
  await updateCatalog('tags', (current) => current.filter((row) => String(row.id) !== tagId));
  await updateCatalog('checksumTags', (current) => current.filter((row) => String(row.tag_id) !== tagId));
  await updateCatalog('roundTags', (current) => current.filter((row) => String(row.tag_id) !== tagId));
  await updateCatalog('steamAccountTags', (current) => current.filter((row) => String(row.tag_id) !== tagId));
}
