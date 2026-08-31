import type { TimestampName } from './timestamp-name';
import { updateCatalog } from 'csdm/node/store/store';

export async function updateTimestamp(timestampName: TimestampName) {
  await updateCatalog('timestamps', (current) => {
    return {
      ...current,
      [timestampName]: new Date().toISOString(),
    };
  });
}
