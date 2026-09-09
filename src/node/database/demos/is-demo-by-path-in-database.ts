import { getStore } from 'csdm/node/store/store';

export async function isDemoByPathInDatabase(filePath: string) {
  await Promise.resolve();
  return getStore().matchIndex.some((row) => row.demoPath === filePath);
}
