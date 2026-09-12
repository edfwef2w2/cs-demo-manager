import path from 'node:path';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import fs from 'fs-extra';
import { Agent, interceptors, request } from 'undici';

const headersTimeoutInMs = 30_000;
const bodyTimeoutInMs = 120_000;

const downloadAgent = new Agent().compose(interceptors.redirect({ maxRedirections: 10 }));

export async function downloadFile(url: string, destinationPath: string) {
  logger.log(`Downloading ${url}`);

  const response = await request(url, {
    dispatcher: downloadAgent,
    headersTimeout: headersTimeoutInMs,
    bodyTimeout: bodyTimeoutInMs,
  });

  if (response.statusCode !== 200 || response.body === null) {
    if (response.body !== null) {
      response.body.resume();
    }
    throw new Error(`Failed to download file (status ${response.statusCode}): ${url}`);
  }

  const contentLength = response.headers['content-length'];
  if (typeof contentLength === 'string') {
    logger.log(`Download size: ${contentLength} bytes`);
  }

  await fs.ensureDir(path.dirname(destinationPath));
  await pipeline(response.body, createWriteStream(destinationPath));
  logger.log(`Downloaded file to ${destinationPath}`);
}
