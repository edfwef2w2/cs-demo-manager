import { updateCatalog } from 'csdm/node/store/store';
import { fetch5EPlayAccounts } from './fetch-5eplay-accounts';
import { updateCurrent5EPlayAccount } from './update-current-5eplay-account';

export async function delete5EPlayAccount(accountId: string) {
  await updateCatalog('fiveEPlayAccounts', (current) => current.filter((row) => row.id !== accountId));
  const accounts = await fetch5EPlayAccounts();

  if (accounts.length > 0) {
    await updateCurrent5EPlayAccount(accounts[0].id);
  }
}
