import { updateCatalog } from 'csdm/node/store/store';
import { updateCurrentRenownAccount } from './update-current-renown-account';
import { fetchRenownAccounts } from './fetch-renown-accounts';

export async function deleteRenownAccount(steamId: string) {
  await updateCatalog('renownAccounts', (current) => current.filter((row) => row.steam_id !== steamId));
  const accounts = await fetchRenownAccounts();

  if (accounts.length > 0) {
    await updateCurrentRenownAccount(accounts[0].id);
  }
}
