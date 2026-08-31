import type { ColumnID } from 'csdm/common/types/column-id';

export type TagTable = {
  id: ColumnID;
  name: string;
  color: string;
};

export type TagRow = TagTable;
export type InsertableTag = Omit<TagTable, 'id'> & { id?: ColumnID };
