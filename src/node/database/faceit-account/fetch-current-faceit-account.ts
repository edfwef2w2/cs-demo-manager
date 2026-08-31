import { getStore } from 'csdm/node/store/store';
import { faceitAccountRowToFaceitAccount } from './faceit-account-row-to-faceit-account';

export async function fetchCurrentFaceitAccount() {
  const row = getStore().catalogs.faceitAccounts.find((account) => account.is_current);

  if (row === undefined) {
    return undefined;
  }

  return faceitAccountRowToFaceitAccount(row);
}
