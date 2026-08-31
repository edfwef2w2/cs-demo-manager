import { getDateDaysAgo } from 'csdm/common/date/get-date-days-ago';
import { unixTimestampToDate } from 'csdm/common/date/unix-timestamp-to-date';
import { getUsersBan } from 'csdm/node/steam-web-api/get-players-bans';
import { getUsersSummary } from 'csdm/node/steam-web-api/get-users-summary';
import { getStore, updateCatalog } from 'csdm/node/store/store';
import type { SteamAccountTable, UpdateableSteamAccount } from './steam-account-table';

function hasAccountBeenBanned({
  currentGameBanCount,
  currentVacBanCount,
  newGameBanCount,
  newVacBanCount,
  daysSinceLastBan,
  updatedAt,
}: {
  daysSinceLastBan: number;
  updatedAt: Date;
  newVacBanCount: number;
  currentVacBanCount: number;
  newGameBanCount: number;
  currentGameBanCount: number;
}) {
  const banCountChanged = newVacBanCount !== currentVacBanCount || newGameBanCount !== currentGameBanCount;
  if (!banCountChanged) {
    return false;
  }

  const banDate = getDateDaysAgo(daysSinceLastBan);

  return banDate > updatedAt;
}

export async function updateSteamAccountsFromSteam(steamIdsToIgnore: string[]) {
  const ignored = new Set(steamIdsToIgnore);
  const rows = getStore().catalogs.steamAccounts.filter((row) => !ignored.has(row.steam_id));

  const steamIds = rows.map((row) => row.steam_id);
  const users = await getUsersSummary(steamIds);
  const bans = await getUsersBan(steamIds);

  const newBannedSteamIds: string[] = [];
  const updates = new Map<string, UpdateableSteamAccount>();
  for (const steamId of steamIds) {
    const user = users.find((item) => item.steamid === steamId);
    if (user === undefined) {
      continue;
    }
    const ban = bans.find((item) => item.SteamId === steamId);
    if (ban === undefined) {
      continue;
    }
    const currentAccountRow = rows.find((row) => row.steam_id === steamId);
    if (currentAccountRow === undefined) {
      continue;
    }

    const accountHasBeenBanned = hasAccountBeenBanned({
      currentVacBanCount: currentAccountRow.vac_ban_count,
      newVacBanCount: ban.NumberOfVACBans,
      currentGameBanCount: currentAccountRow.game_ban_count,
      newGameBanCount: ban.NumberOfGameBans,
      daysSinceLastBan: ban.DaysSinceLastBan,
      updatedAt: currentAccountRow.updated_at,
    });
    if (accountHasBeenBanned) {
      newBannedSteamIds.push(ban.SteamId);
    }

    updates.set(steamId, {
      steam_id: steamId,
      name: user.personaname,
      avatar: user.avatarfull,
      has_private_profile: user.communityvisibilitystate !== 3,
      is_community_banned: ban.CommunityBanned,
      economy_ban: ban.EconomyBan,
      last_ban_date: ban.DaysSinceLastBan > 0 ? getDateDaysAgo(ban.DaysSinceLastBan) : null,
      game_ban_count: ban.NumberOfGameBans,
      vac_ban_count: ban.NumberOfVACBans,
      creation_date: user.timecreated ? unixTimestampToDate(user.timecreated) : null,
    });
  }

  if (updates.size > 0) {
    await updateCatalog('steamAccounts', (current) => {
      return current.map((row) => {
        const update = updates.get(row.steam_id);
        if (!update) {
          return row;
        }
        return {
          ...row,
          ...update,
          updated_at: new Date(),
        } satisfies SteamAccountTable;
      });
    });
  }

  return newBannedSteamIds;
}
