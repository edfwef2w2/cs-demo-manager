import { resetStore } from 'csdm/node/store/store';

export async function resetDatabase() {
  await resetStore();
}
