import { getStore } from 'csdm/node/store/store';
import { fiveEPlayAccountRowTo5EPlayAccount } from './5eplay-account-row-to-5eplay-account';

export async function fetchCurrent5EPlayAccount() {
  await Promise.resolve();
  const row = getStore().catalogs.fiveEPlayAccounts.find((account) => account.is_current);

  if (!row) {
    return undefined;
  }

  return fiveEPlayAccountRowTo5EPlayAccount(row);
}
