import { readMatchDocument } from 'csdm/node/store/match-io';

export async function fetchPlayerSteamIdsInMatch(checksum: string): Promise<string[]> {
  const document = await readMatchDocument(checksum);
  if (!document) {
    return [];
  }

  return document.players.map((player) => player.steam_id);
}
