import type { RenownAccount } from 'csdm/common/types/renown-account';
import { fetchRenownAccount, type RenownAccountDTO } from 'csdm/node/renown/fetch-renown-account-from-steamid';
import { updateCatalog } from 'csdm/node/store/store';
import { fetchRenownAccounts } from './fetch-renown-accounts';

async function buildAccountFromDTO(account: RenownAccountDTO): Promise<RenownAccount> {
  const currentAccounts = await fetchRenownAccounts();
  return {
    id: account.steam_id,
    nickname: account.nickname,
    avatarUrl: account.steam_avatar,
    isCurrent: currentAccounts.length === 0,
  };
}

export async function addRenownAccount(steamId: string) {
  const accountDTO = await fetchRenownAccount(steamId);
  const account = await buildAccountFromDTO(accountDTO);
  await updateCatalog('renownAccounts', (current) => {
    const next = current.filter((row) => row.steam_id !== account.id);
    next.push({
      steam_id: account.id,
      nickname: account.nickname,
      avatar_url: account.avatarUrl,
      is_current: account.isCurrent,
    });
    return next;
  });

  return account;
}
