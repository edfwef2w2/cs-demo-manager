import type { ColumnID } from 'csdm/common/types/column-id';

export type RoundTagTable = {
  checksum: string;
  round_number: number;
  tag_id: ColumnID;
};

export type RoundTagRow = RoundTagTable;
