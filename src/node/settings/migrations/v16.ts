import type { Settings } from '../settings';
import type { Migration } from '../migration';

const v16: Migration = {
  schemaVersion: 16,
  run: (settings: Settings) => {
    settings.video.showLargePlayerCount = true;
    settings.video.outputWidth = 0;
    settings.video.outputHeight = 0;
    settings.video.stretchVideo = false;

    return Promise.resolve(settings);
  },
};

export default v16;
