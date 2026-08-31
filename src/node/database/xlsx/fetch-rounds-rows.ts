import { readMatchDocument } from 'csdm/node/store/match-io';

export type RoundRow = {
  matchChecksum: string;
  number: number;
  startTick: number;
  startFrame: number;
  freezeTimeEndTick: number;
  freezeTimeEndFrame: number;
  endTick: number;
  endFrame: number;
  scoreTeamA: number;
  scoreTeamB: number;
  sideTeamA: number;
  sideTeamB: number;
  startMoneyTeamA: number;
  startMoneyTeamB: number;
  duration: number;
  endReason: number;
  winnerName: string;
  winnerSide: number;
};

export async function fetchRoundsRows(checksums: string[]) {
  const rows: RoundRow[] = [];
  for (const checksum of checksums) {
    const document = await readMatchDocument(checksum);
    for (const round of document?.rounds ?? []) {
      rows.push({
        matchChecksum: checksum,
        number: round.number,
        startTick: round.start_tick,
        startFrame: round.start_frame,
        freezeTimeEndTick: round.freeze_time_end_tick,
        freezeTimeEndFrame: round.freeze_time_end_frame,
        endTick: round.end_tick,
        endFrame: round.end_frame,
        scoreTeamA: round.team_a_score,
        scoreTeamB: round.team_b_score,
        sideTeamA: round.team_a_side,
        sideTeamB: round.team_b_side,
        startMoneyTeamA: round.team_a_start_money,
        startMoneyTeamB: round.team_b_start_money,
        duration: round.duration,
        endReason: round.end_reason,
        winnerName: round.winner_name,
        winnerSide: round.winner_side,
      });
    }
  }

  return rows;
}
