import { getStore } from 'csdm/node/store/store';

function median(values: number[]) {
  if (values.length === 0) {
    return null;
  }
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
}

export async function fetchBannedAccountAgeStats(ignoreBanBeforeFirstSeen: boolean) {
  const { catalogs, playerMatchIndex } = getStore();
  const firstMatchDateBySteamId = new Map<string, string>();
  for (const row of playerMatchIndex) {
    const firstDate = firstMatchDateBySteamId.get(row.steamId);
    if (!firstDate || row.date < firstDate) {
      firstMatchDateBySteamId.set(row.steamId, row.date);
    }
  }

  const now = Date.now();
  const ages: number[] = [];
  for (const account of catalogs.steamAccounts) {
    if (!account.last_ban_date || !account.creation_date) {
      continue;
    }
    if (ignoreBanBeforeFirstSeen) {
      const firstMatchDate = firstMatchDateBySteamId.get(account.steam_id);
      if (!firstMatchDate || account.last_ban_date.toISOString() < firstMatchDate) {
        continue;
      }
    }
    ages.push(now - account.creation_date.getTime());
  }

  const averageAge = ages.length === 0 ? null : ages.reduce((sum, age) => sum + age, 0) / ages.length;
  const medianAge = median(ages);

  return {
    average: averageAge === null ? null : new Date(now - averageAge).toISOString(),
    median: medianAge === null ? null : new Date(now - medianAge).toISOString(),
  };
}
