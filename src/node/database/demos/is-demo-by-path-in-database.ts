import { getStore } from 'csdm/node/store/store';

export function isDemoByPathInDatabase(filePath: string) {
  return getStore().matchIndex.some((row) => row.demoPath === filePath);
}
