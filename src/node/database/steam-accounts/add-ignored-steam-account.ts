import { getPlayerSteamIdFromSteamUrl } from 'csdm/node/steam-web-api/get-player-steam-id-from-steam-url';
import { SteamAccountAlreadyIgnored } from 'csdm/node/database/steam-accounts/errors/steam-account-already-ignored';
import { fetchIgnoredSteamAccounts } from 'csdm/node/database/steam-accounts/fetch-ignored-steam-accounts';
import { insertSteamAccounts } from 'csdm/node/database/steam-accounts/insert-steam-accounts';
import { SteamAccountNotFound } from 'csdm/node/database/steam-accounts/errors/steam-account-not-found';
import { buildSteamAccountsFromSteamIds } from 'csdm/node/database/steam-accounts/build-steam-accounts-from-steam-ids';
import { getStore, updateCatalog } from 'csdm/node/store/store';

export async function addIgnoredSteamAccount(steamIdentifier: string) {
  let steamId = steamIdentifier.trim();
  if (Number.isNaN(Number.parseInt(steamId))) {
    steamId = await getPlayerSteamIdFromSteamUrl(steamIdentifier);
  }

  const accountRows = await buildSteamAccountsFromSteamIds([steamId]);
  if (accountRows.length === 0) {
    throw new SteamAccountNotFound();
  }
  await insertSteamAccounts(accountRows);

  const alreadyIgnored = getStore().catalogs.ignoredSteamAccounts.some((row) => row.steam_id === steamId);
  if (alreadyIgnored) {
    throw new SteamAccountAlreadyIgnored();
  }

  await updateCatalog('ignoredSteamAccounts', (current) => {
    return [...current, { steam_id: steamId }];
  });

  const ignoredAccounts = await fetchIgnoredSteamAccounts([steamId]);
  if (ignoredAccounts.length === 0) {
    throw new SteamAccountNotFound();
  }

  return ignoredAccounts[0];
}
