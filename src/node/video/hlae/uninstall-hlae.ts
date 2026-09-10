import fs from 'fs-extra';
import { isWindows } from 'csdm/node/os/is-windows';
import { getSettings } from 'csdm/node/settings/get-settings';
import { getDefaultHlaeInstallationFolderPath } from './hlae-location';
import { killHlaeProcess } from './kill-hlae-process';

export async function uninstallHlae() {
  if (!isWindows) {
    throw new Error('HLAE is available only on Windows');
  }

  const { video } = await getSettings();
  if (video.hlae.customLocationEnabled) {
    throw new Error('Cannot uninstall HLAE while a custom location is enabled');
  }

  await killHlaeProcess();
  await fs.remove(getDefaultHlaeInstallationFolderPath());
}
