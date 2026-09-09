import { getStore } from 'csdm/node/store/store';
import type { CommentRow } from './comment-table';

export async function fetchComments() {
  await Promise.resolve();
  const rows: CommentRow[] = getStore().catalogs.comments;
  return rows;
}
