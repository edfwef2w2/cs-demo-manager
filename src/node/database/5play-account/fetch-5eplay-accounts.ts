import type { FiveEPlayAccount } from 'csdm/common/types/5eplay-account';
import { getStore } from 'csdm/node/store/store';
import { fiveEPlayAccountRowTo5EPlayAccount } from './5eplay-account-row-to-5eplay-account';

export async function fetch5EPlayAccounts() {
  await Promise.resolve();
  const rows = getStore().catalogs.fiveEPlayAccounts.toSorted((left, right) =>
    left.nickname.localeCompare(right.nickname),
  );
  const accounts: FiveEPlayAccount[] = rows.map(fiveEPlayAccountRowTo5EPlayAccount);

  return accounts;
}
