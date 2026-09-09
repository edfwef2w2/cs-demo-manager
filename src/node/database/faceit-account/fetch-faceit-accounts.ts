import type { FaceitAccount } from '../../../common/types/faceit-account';
import { getStore } from 'csdm/node/store/store';
import { faceitAccountRowToFaceitAccount } from './faceit-account-row-to-faceit-account';

export function fetchFaceitAccounts() {
  const rows = getStore().catalogs.faceitAccounts.toSorted((left, right) =>
    left.nickname.localeCompare(right.nickname),
  );
  const accounts: FaceitAccount[] = rows.map(faceitAccountRowToFaceitAccount);

  return accounts;
}
