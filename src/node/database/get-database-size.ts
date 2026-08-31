import { getStoreSizeLabel } from 'csdm/node/store/store';

export async function getDatabaseSize(): Promise<string> {
  return getStoreSizeLabel();
}
