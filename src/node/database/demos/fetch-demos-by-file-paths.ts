import type { Demo } from 'csdm/common/types/demo';
import { demoRowToDemo } from './demo-row-to-demo';
import { fetchChecksumTags } from '../tags/fetch-checksum-tags';
import { getStore } from 'csdm/node/store/store';
import { readJsonFile } from 'csdm/node/store/atomic-write';
import { getDemoFilePath } from 'csdm/node/store/paths';
import type { DemoRow } from './demo-table';

export async function fetchDemosByFilePaths(filePaths: string[]): Promise<Demo[]> {
  if (filePaths.length === 0) {
    return [];
  }

  const { catalogs, rootPath, matchIndex } = getStore();
  const checksumTags = await fetchChecksumTags();
  const pathSet = new Set(filePaths);
  const demos: Demo[] = [];

  for (const pathRow of catalogs.demoPaths) {
    if (!pathSet.has(pathRow.file_path)) {
      continue;
    }

    const row = await readJsonFile<DemoRow>(getDemoFilePath(rootPath, pathRow.checksum));
    if (row === undefined) {
      continue;
    }

    row.date = new Date(row.date);
    const match = matchIndex.find((item) => item.checksum === pathRow.checksum);
    const comment = catalogs.comments.find((item) => item.checksum === pathRow.checksum)?.comment ?? null;
    const tagIds = checksumTags.filter(({ checksum }) => checksum === pathRow.checksum).map((item) => item.tag_id);
    demos.push(
      demoRowToDemo(
        {
          ...row,
          analyzeDate: match ? new Date(match.analyzeDate) : null,
        },
        pathRow.file_path,
        tagIds,
        comment,
      ),
    );
  }

  return demos;
}
