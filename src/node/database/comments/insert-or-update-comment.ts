import { updateCatalog } from 'csdm/node/store/store';

export async function insertOrUpdateComment(checksum: string, comment: string) {
  await updateCatalog('comments', (current) => {
    const next = current.filter((row) => row.checksum !== checksum);
    next.push({ checksum, comment });
    return next;
  });
}
