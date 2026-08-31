import { getStore } from 'csdm/node/store/store';
import type { TimestampName } from './timestamp-name';

export async function isTimestampExpired(name: TimestampName, maxAgeInMs: number) {
  const value = getStore().catalogs.timestamps[name];
  if (!value) {
    return true;
  }

  return Date.now() - new Date(value).getTime() > maxAgeInMs;
}
