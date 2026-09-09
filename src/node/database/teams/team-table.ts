import type { TeamLetter, TeamNumber } from 'csdm/common/types/counter-strike';
import type { ColumnID } from 'csdm/common/types/column-id';

type TeamTable = {
  id: ColumnID;
  match_checksum: string;
  current_side: TeamNumber;
  name: string;
  letter: TeamLetter;
  score: number;
  score_first_half: number;
  score_second_half: number;
};

export type TeamRow = TeamTable;
