import fs from 'fs-extra';
import { getSettings } from 'csdm/node/settings/get-settings';
import { getDefaultFfmpegInstallationPath } from './ffmpeg-location';
import { killFfmpegProcess } from './kill-ffmpeg-process';

export async function uninstallFfmpeg() {
  const { video } = await getSettings();
  if (video.ffmpegSettings.customLocationEnabled) {
    throw new Error('Cannot uninstall FFmpeg while a custom location is enabled');
  }

  await killFfmpegProcess();
  await fs.remove(getDefaultFfmpegInstallationPath());
}
