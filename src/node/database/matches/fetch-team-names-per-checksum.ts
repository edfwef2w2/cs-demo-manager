import { TeamLetter } from 'csdm/common/types/counter-strike';
import { getStore } from 'csdm/node/store/store';

export type TeamNamesPerChecksum = { [checksum: string]: { teamNameA: string; teamNameB: string } };

export async function fetchTeamNamesPerChecksum(checksums: string[]): Promise<TeamNamesPerChecksum> {
  const checksumSet = new Set(checksums);
  const teamNamesPerChecksum: TeamNamesPerChecksum = {};

  for (const row of getStore().matchIndex) {
    if (!checksumSet.has(row.checksum)) {
      continue;
    }
    teamNamesPerChecksum[row.checksum] = {
      teamNameA: row.teamAName,
      teamNameB: row.teamBName,
    };
  }

  return teamNamesPerChecksum;
}
