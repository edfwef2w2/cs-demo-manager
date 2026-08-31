import { closeStore } from 'csdm/node/store/store';

export async function destroyDatabaseConnection() {
  await closeStore();
}
