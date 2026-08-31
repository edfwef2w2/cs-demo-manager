import { assertValidTag } from './assert-valid-tag';
import { TagNameAlreadyTaken } from './errors/tag-name-already-taken';
import { tagRowToTag } from './tag-row-to-tag';
import type { InsertableTag } from './tag-table';
import { nextNumericId } from 'csdm/node/store/next-id';
import { updateCatalog } from 'csdm/node/store/store';

export async function insertTag(tag: InsertableTag) {
  assertValidTag(tag);

  const tags = await updateCatalog('tags', (current) => {
    if (current.some((row) => row.name === tag.name)) {
      throw new TagNameAlreadyTaken();
    }

    return [
      ...current,
      {
        id: tag.id ?? nextNumericId(current),
        name: tag.name,
        color: tag.color,
      },
    ];
  });

  const inserted = tags[tags.length - 1];
  return tagRowToTag(inserted);
}
