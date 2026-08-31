import { getStore } from 'csdm/node/store/store';

export async function fetchMatchCount(): Promise<number> {
  return getStore().matchIndex.length;
}
