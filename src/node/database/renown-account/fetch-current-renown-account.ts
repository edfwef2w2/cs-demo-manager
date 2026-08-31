import { getStore } from 'csdm/node/store/store';
import { renownAccountRowToRenownAccount } from './renown-account-row-to-renown-account';

export async function fetchCurrentRenownAccount() {
  const row = getStore().catalogs.renownAccounts.find((account) => account.is_current);

  if (!row) {
    return null;
  }

  return renownAccountRowToRenownAccount(row);
}
