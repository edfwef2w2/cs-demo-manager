import fs from 'fs-extra';
import path from 'node:path';
import { getMatchesFolderPath } from 'csdm/node/store/paths';
import { getStore } from 'csdm/node/store/store';

export async function deletePositions() {
  const { rootPath, matchIndex } = getStore();
  const matchesFolderPath = getMatchesFolderPath(rootPath);
  await Promise.all(
    matchIndex.map((row) => {
      return fs.remove(path.join(matchesFolderPath, row.checksum, 'positions'));
    }),
  );
}
