import { updateCatalog } from 'csdm/node/store/store';

export async function insertOrUpdateRoundComment(checksum: string, number: number, comment: string) {
  await updateCatalog('roundComments', (current) => {
    const next = current.filter((row) => !(row.match_checksum === checksum && row.number === number));
    next.push({ match_checksum: checksum, number, comment });
    return next;
  });
}
