import type { PlayerEconomy } from 'csdm/common/types/player-economy';
import { playerEconomyRowToPlayerEconomy } from './player-economy-row-to-player-economy';
import type { PlayerEconomyTable } from './player-economy-table';
import { readMatchEvents } from 'csdm/node/store/match-io';

export async function fetchPlayersEconomies(checksum: string) {
  const rows = await readMatchEvents<PlayerEconomyTable>(checksum, 'economies');
  const playersEconomy: PlayerEconomy[] = rows
    .slice()
    .sort((left, right) => left.round_number - right.round_number)
    .map((row) => {
      return playerEconomyRowToPlayerEconomy(row);
    });

  return playersEconomy;
}
