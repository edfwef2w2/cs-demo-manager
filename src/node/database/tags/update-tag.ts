import { assertValidTag } from './assert-valid-tag';
import { TagNameAlreadyTaken } from './errors/tag-name-already-taken';
import type { Tag } from '../../../common/types/tag';
import { updateCatalog } from 'csdm/node/store/store';

export async function updateTag(tag: Tag) {
  assertValidTag(tag);

  await updateCatalog('tags', (current) => {
    if (current.some((row) => row.name === tag.name && String(row.id) !== tag.id)) {
      throw new TagNameAlreadyTaken();
    }

    return current.map((row) => {
      if (String(row.id) !== tag.id) {
        return row;
      }

      return {
        ...row,
        name: tag.name,
        color: tag.color,
      };
    });
  });
}
