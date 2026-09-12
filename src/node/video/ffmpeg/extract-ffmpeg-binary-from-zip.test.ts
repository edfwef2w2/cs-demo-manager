import { createWriteStream } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { ZipArchive } from 'archiver';
import { describe, expect, it } from 'vite-plus/test';
import { extractFfmpegBinaryFromZip } from './extract-ffmpeg-binary-from-zip';

async function createFixtureZip(folderPath: string) {
  const zipPath = path.join(folderPath, 'fixture.zip');

  await new Promise<void>((resolve, reject) => {
    const output = createWriteStream(zipPath);
    const zip = new ZipArchive();
    zip.on('error', reject);
    output.on('close', () => {
      resolve();
    });
    zip.pipe(output);
    zip.append('ffmpeg-binary', { name: 'ffmpeg-8.0-essentials_build/bin/ffmpeg.exe' });
    zip.append('docs', { name: 'ffmpeg-8.0-essentials_build/README.txt' });
    zip.append('ffplay', { name: 'ffmpeg-8.0-essentials_build/bin/ffplay.exe' });
    void zip.finalize();
  });

  return zipPath;
}

describe('extractFfmpegBinaryFromZip', () => {
  it('writes only the ffmpeg binary to the destination path', async () => {
    const folderPath = await fs.mkdtemp(path.join(os.tmpdir(), 'ffmpeg-extract-'));
    const zipPath = await createFixtureZip(folderPath);
    const executablePath = path.join(folderPath, 'ffmpeg', 'bin', 'ffmpeg.exe');

    await extractFfmpegBinaryFromZip(zipPath, executablePath);

    expect(await fs.readFile(executablePath, 'utf8')).toBe('ffmpeg-binary');
    expect(await fs.pathExists(path.join(folderPath, 'ffmpeg', 'bin', 'ffplay.exe'))).toBe(false);
    expect(await fs.pathExists(path.join(folderPath, 'ffmpeg', 'README.txt'))).toBe(false);

    await fs.remove(folderPath);
  });
});
