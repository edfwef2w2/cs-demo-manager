import type { Demo } from 'csdm/common/types/demo';
import { writeJsonAtomic } from 'csdm/node/store/atomic-write';
import { getDemoFilePath } from 'csdm/node/store/paths';
import { getStore, updateCatalog } from 'csdm/node/store/store';
import { demoToDemoRow } from './demo-to-demo-row';
import fs from 'fs-extra';

export async function insertDemos(demos: Demo[]) {
  try {
    const { rootPath } = getStore();
    await Promise.all(
      demos.map(async (demo) => {
        const filePath = getDemoFilePath(rootPath, demo.checksum);
        if (!(await fs.pathExists(filePath))) {
          await writeJsonAtomic(filePath, demoToDemoRow(demo));
        }
      }),
    );

    await updateCatalog('demoPaths', (current) => {
      const existing = new Set(current.map((row) => `${row.checksum}:${row.file_path}`));
      const next = [...current];
      for (const demo of demos) {
        const key = `${demo.checksum}:${demo.filePath}`;
        if (!existing.has(key)) {
          next.push({ checksum: demo.checksum, file_path: demo.filePath });
          existing.add(key);
        }
      }
      return next;
    });
  } catch (error) {
    logger.log('Error while inserting demos');
    logger.log(error);
    throw error;
  }
}
