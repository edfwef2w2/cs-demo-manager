import { playerBlindRowToPlayerBlind } from './player-blind-row-to-player-blind';
import type { PlayerBlind } from 'csdm/common/types/player-blind';
import type { PlayerBlindTable } from './player-blind-table';
import { readMatchEvents } from 'csdm/node/store/match-io';

export async function fetchPlayerBlinds(checksum: string) {
  const rows = await readMatchEvents<PlayerBlindTable>(checksum, 'blinds');
  const playerBlinds: PlayerBlind[] = rows.map((row) => {
    return playerBlindRowToPlayerBlind(row);
  });

  return playerBlinds;
}
