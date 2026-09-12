import fs from 'fs-extra';
import path from 'node:path';
import StreamZip from 'node-stream-zip';
import { findFfmpegZipEntryName } from './find-ffmpeg-zip-entry-name';

export async function extractFfmpegBinaryFromZip(zipPath: string, executablePath: string) {
  const zip = new StreamZip.async({
    file: zipPath,
  });

  try {
    const entries = await zip.entries();
    const entryName = findFfmpegZipEntryName(Object.keys(entries));
    const data = await zip.entryData(entryName);
    await fs.ensureDir(path.dirname(executablePath));
    await fs.writeFile(executablePath, data);
  } finally {
    await zip.close();
  }
}
