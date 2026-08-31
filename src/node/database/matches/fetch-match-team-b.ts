import { TeamLetter } from 'csdm/common/types/counter-strike';
import { teamRowToTeam } from '../teams/team-row-to-team';
import type { Team } from 'csdm/common/types/team';
import { readMatchDocument } from 'csdm/node/store/match-io';

export async function fetchMatchTeamB(checksum: string): Promise<Team> {
  const document = await readMatchDocument(checksum);
  const teamRow = document?.teams.find((team) => team.letter === TeamLetter.B);

  if (teamRow === undefined) {
    throw new Error('Team B not found');
  }

  return teamRowToTeam(teamRow);
}
