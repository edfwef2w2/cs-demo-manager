import { openStore } from 'csdm/node/store/store';
import { startBackgroundTasks } from 'csdm/server/start-background-tasks';

export async function connectDatabase() {
  await openStore();
  void startBackgroundTasks();
}
