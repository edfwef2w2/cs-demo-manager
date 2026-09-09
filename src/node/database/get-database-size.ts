import { getStoreSizeLabel } from 'csdm/node/store/store';

export function getDatabaseSize(): Promise<string> {
  return getStoreSizeLabel();
}
