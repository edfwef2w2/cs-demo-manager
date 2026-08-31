import { updateCatalog } from 'csdm/node/store/store';
import type { InsertableSteamAccount, SteamAccountTable } from './steam-account-table';

export async function insertSteamAccounts(accounts: InsertableSteamAccount[]) {
  if (accounts.length === 0) {
    return;
  }

  await updateCatalog('steamAccounts', (current) => {
    const next = [...current];
    for (const account of accounts) {
      const index = next.findIndex((row) => row.steam_id === account.steam_id);
      const now = new Date();
      const row: SteamAccountTable = {
        steam_id: account.steam_id,
        is_community_banned: account.is_community_banned,
        has_private_profile: account.has_private_profile,
        vac_ban_count: account.vac_ban_count,
        last_ban_date: account.last_ban_date,
        game_ban_count: account.game_ban_count,
        economy_ban: account.economy_ban,
        avatar: account.avatar,
        name: account.name,
        creation_date: account.creation_date,
        created_at: account.created_at ?? now,
        updated_at: now,
      };
      if (index >= 0) {
        next[index] = {
          ...next[index],
          name: row.name,
          avatar: row.avatar,
          creation_date: row.creation_date,
          economy_ban: row.economy_ban,
          game_ban_count: row.game_ban_count,
          has_private_profile: row.has_private_profile,
          is_community_banned: row.is_community_banned,
          last_ban_date: row.last_ban_date,
          vac_ban_count: row.vac_ban_count,
          updated_at: now,
        };
      } else {
        next.push(row);
      }
    }
    return next;
  });
}
