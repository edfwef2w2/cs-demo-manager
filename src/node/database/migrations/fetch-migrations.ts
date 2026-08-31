import { readJsonFile } from 'csdm/node/store/atomic-write';
import { getMetaFilePath } from 'csdm/node/store/paths';
import { CURRENT_STORE_SCHEMA_VERSION } from 'csdm/node/store/schema-version';
import { getStore } from 'csdm/node/store/store';

export type Migration = { version: number; date: string };

type StoreMeta = {
  schemaVersion: number;
};

export async function fetchMigrations(limit: number): Promise<Migration[]> {
  if (limit <= 0) {
    return [];
  }

  const { rootPath } = getStore();
  const meta = await readJsonFile<StoreMeta>(getMetaFilePath(rootPath));
  const version = meta?.schemaVersion ?? CURRENT_STORE_SCHEMA_VERSION;

  return [
    {
      version,
      date: new Date(0).toISOString(),
    },
  ];
}
