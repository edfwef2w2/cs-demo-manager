import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { downloadFile } from 'csdm/node/filesystem/download-file';
import { isWindows } from 'csdm/node/os/is-windows';
import { fetchLastFfmpegVersion } from './fetch-last-ffmpeg-version';
import { getFfmpegArchivePlatform, getFfmpegArchiveUrl } from './ffmpeg-archive';
import { extractFfmpegBinaryFromZip } from './extract-ffmpeg-binary-from-zip';
import { extractFfmpegBinaryFromXz } from './extract-ffmpeg-binary-from-xz';
import { getDefaultFfmpegInstallationPath, getDefaultFfmpegExecutablePath } from './ffmpeg-location';

export async function installFfmpeg(): Promise<string> {
  const lastVersion = await fetchLastFfmpegVersion();
  const platform = getFfmpegArchivePlatform();
  const archiveUrl = getFfmpegArchiveUrl(platform, lastVersion);
  const executablePath = getDefaultFfmpegExecutablePath();
  const archivePath = path.join(os.tmpdir(), path.basename(archiveUrl));

  await downloadFile(archiveUrl, archivePath);

  try {
    await fs.remove(getDefaultFfmpegInstallationPath());
    if (platform === 'linux') {
      await extractFfmpegBinaryFromXz(archivePath, executablePath);
    } else {
      await extractFfmpegBinaryFromZip(archivePath, executablePath);
    }

    if (!isWindows) {
      await fs.chmod(executablePath, 0o755);
    }
  } finally {
    await fs.remove(archivePath);
  }

  return lastVersion.split('-')[0];
}
