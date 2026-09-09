import { getStore } from 'csdm/node/store/store';
import type { CommentRow } from './comment-table';

export function fetchComments() {
  const rows: CommentRow[] = getStore().catalogs.comments;
  return rows;
}
