import { getStore } from 'csdm/node/store/store';

export async function fetchPlayersTagIds(steamIds: string[]) {
  if (steamIds.length === 0) {
    return {};
  }

  const steamIdSet = new Set(steamIds);
  const tagIdsPerSteamId: { [steamId: string]: string[] } = {};
  for (const row of getStore().catalogs.steamAccountTags) {
    if (!steamIdSet.has(row.steam_id)) {
      continue;
    }
    if (!tagIdsPerSteamId[row.steam_id]) {
      tagIdsPerSteamId[row.steam_id] = [];
    }
    tagIdsPerSteamId[row.steam_id].push(String(row.tag_id));
  }

  return tagIdsPerSteamId;
}
