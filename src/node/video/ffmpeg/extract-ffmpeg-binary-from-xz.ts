import path from 'node:path';
import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import fs from 'fs-extra';

export async function extractFfmpegBinaryFromXz(archivePath: string, executablePath: string) {
  await fs.ensureDir(path.dirname(executablePath));

  const tar = spawn('tar', ['-xJf', archivePath, '--to-stdout', '--wildcards', '*/bin/ffmpeg'], {
    windowsHide: true,
  });

  if (tar.stdout === null) {
    throw new Error('Failed to read FFmpeg binary from archive');
  }

  const stderrChunks: Buffer[] = [];
  tar.stderr?.on('data', (chunk) => {
    stderrChunks.push(Buffer.from(chunk));
  });

  const closePromise = new Promise<number>((resolve, reject) => {
    tar.once('error', reject);
    tar.once('close', (code) => {
      resolve(code ?? 1);
    });
  });

  try {
    await pipeline(tar.stdout, createWriteStream(executablePath));
  } catch (error) {
    await fs.remove(executablePath);
    throw error;
  }

  const exitCode = await closePromise;

  if (exitCode !== 0) {
    await fs.remove(executablePath);
    const stderr = Buffer.concat(stderrChunks).toString('utf8');
    throw new Error(`Failed to extract FFmpeg from archive (exit ${exitCode}): ${stderr}`);
  }
}
