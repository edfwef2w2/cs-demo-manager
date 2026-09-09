import fs from 'fs-extra';
import { getStore, updateCatalog } from 'csdm/node/store/store';

export async function deleteOrphanDemoPaths() {
  const current = getStore().catalogs.demoPaths;
  const next: typeof current = [];
  for (const row of current) {
    if (await fs.pathExists(row.file_path)) {
      next.push(row);
    }
  }
  await updateCatalog('demoPaths', () => next);
}
