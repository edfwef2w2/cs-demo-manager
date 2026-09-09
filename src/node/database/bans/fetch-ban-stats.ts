import { roundNumber } from 'csdm/common/math/round-number';
import type { BanStats } from 'csdm/common/types/ban-stats';
import { fetchMatchCount } from 'csdm/node/database/matches/fetch-match-count';
import { fetchBannedSteamAccounts } from 'csdm/node/database/steam-accounts/fetch-banned-steam-accounts';
import { fetchBannedAccountAgeStats } from 'csdm/node/database/steam-accounts/fetch-banned-account-age-stats';
import { getBanSettings } from 'csdm/node/settings/get-settings';
import { getStore } from 'csdm/node/store/store';

function fetchAccountCount() {
  const { playerMatchIndex, catalogs } = getStore();
  const ignored = new Set(catalogs.ignoredSteamAccounts.map((row) => row.steam_id));
  const steamIds = new Set<string>();
  for (const row of playerMatchIndex) {
    if (!ignored.has(row.steamId)) {
      steamIds.add(row.steamId);
    }
  }
  return steamIds.size;
}

export async function fetchBanStats(): Promise<BanStats> {
  const { ignoreBanBeforeFirstSeen } = await getBanSettings();
  const accountCount = fetchAccountCount();
  const [bannedAccounts, matchCount, age] = await Promise.all([
    fetchBannedSteamAccounts(ignoreBanBeforeFirstSeen),
    fetchMatchCount(),
    fetchBannedAccountAgeStats(ignoreBanBeforeFirstSeen),
  ]);
  const bannedAccountCount = bannedAccounts.length;
  const bannedAccountPercentage = accountCount > 0 ? roundNumber((bannedAccountCount / accountCount) * 100) : 0;
  const averageBannedAccountPerMatch = matchCount > 0 ? roundNumber(bannedAccountCount / matchCount, 1) : 0;

  return {
    bannedAccounts,
    bannedAccountCount,
    accountCount,
    bannedAccountPercentage,
    averageBannedAccountPerMatch,
    averageBannedAccountAgeInMonths: age.average,
    medianBannedAccountAgeInMonths: age.median,
  };
}
