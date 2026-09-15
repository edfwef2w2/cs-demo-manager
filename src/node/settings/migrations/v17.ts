import type { Settings } from '../settings';
import type { Migration } from '../migration';

const v17: Migration = {
  schemaVersion: 17,
  run: (settings: Settings) => {
    settings.video.showLargePlayerCount = true;

    return Promise.resolve(settings);
  },
};

export default v17;
