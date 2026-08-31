import type { PlayerWatchInfo } from 'csdm/common/types/player-watch-info';
import { readMatchDocument } from 'csdm/node/store/match-io';

export async function fetchMatchPlayersSlots(checksum: string): Promise<PlayerWatchInfo[]> {
  const document = await readMatchDocument(checksum);
  if (!document) {
    return [];
  }

  return document.players.map((player) => {
    const team = document.teams.find((item) => item.name === player.team_name);
    return {
      steamId: player.steam_id,
      side: team?.current_side ?? 0,
      slot: player.index,
      userId: player.index - 1,
    };
  });
}
