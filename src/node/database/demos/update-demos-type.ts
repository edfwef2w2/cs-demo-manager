import type { DemoType } from 'csdm/common/types/counter-strike';
import type { DemoRow } from './demo-table';
import { getStore, saveIndexes } from 'csdm/node/store/store';
import { readJsonFile, writeJsonAtomic } from 'csdm/node/store/atomic-write';
import { getDemoFilePath } from 'csdm/node/store/paths';
import { readMatchDocument, writeMatchDocument, getOpenedMatchFolderPath } from 'csdm/node/store/match-io';

export async function updateDemosType(checksums: string[], type: DemoType) {
  const { rootPath, matchIndex } = getStore();
  const checksumSet = new Set(checksums);

  await Promise.all(
    checksums.map(async (checksum) => {
      const demoFilePath = getDemoFilePath(rootPath, checksum);
      const demoRow = await readJsonFile<DemoRow>(demoFilePath);
      if (demoRow) {
        demoRow.type = type;
        await writeJsonAtomic(demoFilePath, demoRow);
      }

      const document = await readMatchDocument(checksum);
      if (document) {
        document.demo.type = type;
        await writeMatchDocument(getOpenedMatchFolderPath(checksum), document);
      }
    }),
  );

  let updated = false;
  for (const row of matchIndex) {
    if (checksumSet.has(row.checksum)) {
      row.type = type;
      updated = true;
    }
  }
  if (updated) {
    await saveIndexes();
  }
}
