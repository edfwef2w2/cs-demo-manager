import { updateCatalog } from 'csdm/node/store/store';

export async function updateCurrent5EPlayAccount(accountId: string) {
  await updateCatalog('fiveEPlayAccounts', (current) => {
    return current.map((row) => {
      return {
        ...row,
        is_current: row.id === accountId,
      };
    });
  });
}
