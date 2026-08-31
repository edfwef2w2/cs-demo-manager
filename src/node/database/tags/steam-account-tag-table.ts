import type { ColumnID } from 'csdm/common/types/column-id';

export type SteamAccountTagTable = {
  steam_id: string;
  tag_id: ColumnID;
};

export type SteamAccountTagRow = SteamAccountTagTable;
