import { getStore } from 'csdm/node/store/store';

export async function fetchMatchCount(): Promise<number> {
  await Promise.resolve();
  return getStore().matchIndex.length;
}
