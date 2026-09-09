import { getStore } from 'csdm/node/store/store';

export function fetchMatchCount(): Promise<number> {
  return getStore().matchIndex.length;
}
