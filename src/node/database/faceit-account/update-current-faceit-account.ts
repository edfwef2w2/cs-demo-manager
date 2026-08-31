import { updateCatalog } from 'csdm/node/store/store';

export async function updateCurrentFaceitAccount(accountId: string) {
  await updateCatalog('faceitAccounts', (current) => {
    return current.map((row) => {
      return {
        ...row,
        is_current: row.id === accountId,
      };
    });
  });
}
