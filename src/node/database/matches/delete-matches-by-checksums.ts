import fs from 'fs-extra';
import { getMatchFolderPath } from 'csdm/node/store/paths';
import { getStore, removeMatchIndexRows } from 'csdm/node/store/store';

export async function deleteMatchesByChecksums(checksums: string[]) {
  if (checksums.length === 0) {
    return;
  }

  const { rootPath } = getStore();
  await Promise.all(
    checksums.map((checksum) => {
      return fs.remove(getMatchFolderPath(rootPath, checksum));
    }),
  );
  await removeMatchIndexRows(checksums);
}
