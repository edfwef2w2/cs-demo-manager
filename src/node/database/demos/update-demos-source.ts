import type { DemoSource } from 'csdm/common/types/counter-strike';
import type { DemoRow } from './demo-table';
import { getStore, saveIndexes } from 'csdm/node/store/store';
import { readJsonFile, writeJsonAtomic } from 'csdm/node/store/atomic-write';
import { getDemoFilePath } from 'csdm/node/store/paths';
import { readMatchDocument, writeMatchDocument, getOpenedMatchFolderPath } from 'csdm/node/store/match-io';

export async function updateDemosSource(checksums: string[], source: DemoSource) {
  const { rootPath, matchIndex } = getStore();
  const checksumSet = new Set(checksums);

  await Promise.all(
    checksums.map(async (checksum) => {
      const demoFilePath = getDemoFilePath(rootPath, checksum);
      const demoRow = await readJsonFile<DemoRow>(demoFilePath);
      if (demoRow) {
        demoRow.source = source;
        await writeJsonAtomic(demoFilePath, demoRow);
      }

      const document = await readMatchDocument(checksum);
      if (document) {
        document.demo.source = source;
        await writeMatchDocument(getOpenedMatchFolderPath(checksum), document);
      }
    }),
  );

  let updated = false;
  for (const row of matchIndex) {
    if (checksumSet.has(row.checksum)) {
      row.source = source;
      updated = true;
    }
  }
  if (updated) {
    await saveIndexes();
  }
}
