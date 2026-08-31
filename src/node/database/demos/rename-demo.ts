import { isBlankString } from 'csdm/common/string/is-empty-string';
import { InvalidDemoName } from './errors/invalid-demo-name';
import type { DemoRow } from './demo-table';
import { getStore, saveIndexes } from 'csdm/node/store/store';
import { readJsonFile, writeJsonAtomic } from 'csdm/node/store/atomic-write';
import { getDemoFilePath } from 'csdm/node/store/paths';
import { readMatchDocument, writeMatchDocument, getOpenedMatchFolderPath } from 'csdm/node/store/match-io';

export async function renameDemo(checksum: string, name: string) {
  if (isBlankString(name)) {
    throw new InvalidDemoName();
  }

  const { rootPath, matchIndex } = getStore();
  const demoFilePath = getDemoFilePath(rootPath, checksum);
  const demoRow = await readJsonFile<DemoRow>(demoFilePath);
  if (demoRow) {
    demoRow.name = name;
    await writeJsonAtomic(demoFilePath, demoRow);
  }

  const document = await readMatchDocument(checksum);
  if (document) {
    document.demo.name = name;
    await writeMatchDocument(getOpenedMatchFolderPath(checksum), document);
  }

  const indexRow = matchIndex.find((row) => row.checksum === checksum);
  if (indexRow) {
    indexRow.name = name;
    await saveIndexes();
  }
}
