import { updateCurrentFaceitAccount } from 'csdm/node/database/faceit-account/update-current-faceit-account';
import { updateCatalog } from 'csdm/node/store/store';
import { fetchFaceitAccounts } from './fetch-faceit-accounts';

export async function deleteFaceitAccount(accountId: string) {
  await updateCatalog('faceitAccounts', (current) => current.filter((row) => row.id !== accountId));
  const accounts = await fetchFaceitAccounts();

  if (accounts.length > 0) {
    await updateCurrentFaceitAccount(accounts[0].id);
  }
}
