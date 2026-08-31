import { getStore } from 'csdm/node/store/store';

export async function fetchRoundTags(checksum: string, roundNumber?: number) {
  return getStore()
    .catalogs.roundTags.filter((row) => {
      if (row.checksum !== checksum) {
        return false;
      }
      if (roundNumber && row.round_number !== roundNumber) {
        return false;
      }
      return true;
    })
    .map((row) => {
      return {
        checksum: row.checksum,
        round_number: row.round_number,
        tag_id: String(row.tag_id),
      };
    });
}
