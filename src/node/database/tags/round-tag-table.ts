import type { ColumnID } from 'csdm/common/types/column-id';

type RoundTagTable = {
  checksum: string;
  round_number: number;
  tag_id: ColumnID;
};

export type RoundTagRow = RoundTagTable;
