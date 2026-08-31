import type { TeamNumber } from 'csdm/common/types/counter-strike';
import { readMatchEvents } from 'csdm/node/store/match-io';
import type { ClutchRow as ClutchTableRow } from '../clutches/clutch-table';

export type ClutchRow = {
  matchChecksum: string;
  roundNumber: number;
  tick: number;
  playerName: string;
  playerSteamId: string;
  playerSide: TeamNumber;
  hasWon: boolean;
  opponentCount: number;
  killCount: number;
};

export async function fetchClutchesRows(checksums: string[]): Promise<ClutchRow[]> {
  const rows: ClutchRow[] = [];
  for (const checksum of checksums) {
    const clutches = await readMatchEvents<ClutchTableRow>(checksum, 'clutches');
    for (const clutch of clutches) {
      rows.push({
        matchChecksum: checksum,
        roundNumber: clutch.round_number,
        tick: clutch.tick,
        playerName: clutch.clutcher_name,
        playerSteamId: clutch.clutcher_steam_id,
        playerSide: clutch.side,
        hasWon: clutch.won,
        opponentCount: clutch.opponent_count,
        killCount: clutch.clutcher_kill_count,
      });
    }
  }

  return rows;
}
