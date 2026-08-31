import type { Demo } from 'csdm/common/types/demo';
import { fetchChecksumTagIds } from '../tags/fetch-checksum-tag-ids';
import type { DemoRow } from './demo-table';
import { demoRowToDemo } from './demo-row-to-demo';
import { getStore } from 'csdm/node/store/store';
import { readJsonFile } from 'csdm/node/store/atomic-write';
import { getDemoFilePath } from 'csdm/node/store/paths';

export async function fetchDemoByChecksum(checksum: string): Promise<Demo | undefined> {
  const { catalogs, rootPath, matchIndex } = getStore();
  const pathRow = catalogs.demoPaths.find((row) => row.checksum === checksum);
  if (pathRow === undefined) {
    return undefined;
  }

  const row = await readJsonFile<DemoRow>(getDemoFilePath(rootPath, checksum));
  if (row === undefined) {
    return undefined;
  }

  row.date = new Date(row.date);
  const match = matchIndex.find((item) => item.checksum === checksum);
  const comment = catalogs.comments.find((item) => item.checksum === checksum)?.comment ?? null;
  const tagIds = await fetchChecksumTagIds(checksum);

  return demoRowToDemo(
    {
      ...row,
      analyzeDate: match ? new Date(match.analyzeDate) : null,
    },
    pathRow.file_path,
    tagIds,
    comment,
  );
}
