import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import StreamZip from 'node-stream-zip';
import { downloadFile } from './download-file';

export async function downloadAndExtractZipArchive(archiveUrl: string, destinationPath: string) {
  const zipPath = path.join(os.tmpdir(), path.basename(archiveUrl));
  await downloadFile(archiveUrl, zipPath);

  const zip = new StreamZip.async({
    file: zipPath,
  });

  try {
    try {
      await fs.mkdir(destinationPath, { recursive: true });
      await zip.extract(null, destinationPath);
    } finally {
      await zip.close();
    }
  } finally {
    await fs.remove(zipPath);
  }
}
