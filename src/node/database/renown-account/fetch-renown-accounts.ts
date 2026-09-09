import { getStore } from 'csdm/node/store/store';
import { renownAccountRowToRenownAccount } from './renown-account-row-to-renown-account';

export function fetchRenownAccounts() {
  const rows = getStore().catalogs.renownAccounts.toSorted((left, right) =>
    left.nickname.localeCompare(right.nickname),
  );
  const accounts = rows.map(renownAccountRowToRenownAccount);

  return accounts;
}
