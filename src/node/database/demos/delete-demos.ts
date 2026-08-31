import fs from 'fs-extra';
import { getDemoFilePath, getDemosFolderPath } from 'csdm/node/store/paths';
import { getStore, updateCatalog } from 'csdm/node/store/store';

export async function deleteDemos() {
  const { rootPath, matchIndex } = getStore();
  const matchChecksums = new Set(matchIndex.map((row) => row.checksum));
  const demoFiles = await fs.readdir(getDemosFolderPath(rootPath));
  const checksumsToDelete = demoFiles
    .filter((fileName) => fileName.endsWith('.json'))
    .map((fileName) => fileName.replace(/\.json$/, ''))
    .filter((checksum) => !matchChecksums.has(checksum));

  await Promise.all(
    checksumsToDelete.map((checksum) => {
      return fs.remove(getDemoFilePath(rootPath, checksum));
    }),
  );

  await updateCatalog('demoPaths', (current) => current.filter((row) => matchChecksums.has(row.checksum)));
}
