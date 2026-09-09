import type { ColumnID } from 'csdm/common/types/column-id';

type FaceitMatchTeamTable = {
  id: ColumnID;
  faceit_id: string;
  name: string;
  score: number;
  first_half_score: number;
  second_half_score: number;
  overtime_score: number;
  faceit_match_id: string;
};

export type FaceitMatchTeamRow = FaceitMatchTeamTable;
