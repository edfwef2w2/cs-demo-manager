import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vite-plus/test';
import { readJsonFile, writeJsonAtomic } from './atomic-write';

describe('writeJsonAtomic', () => {
  it('writes and reads JSON', async () => {
    const folderPath = await mkdtemp(path.join(os.tmpdir(), 'csdm-store-'));
    const filePath = path.join(folderPath, 'data.json');

    await writeJsonAtomic(filePath, { hello: 'world' });
    const data = await readJsonFile<{ hello: string }>(filePath);

    expect(data).toEqual({ hello: 'world' });
    await rm(folderPath, { recursive: true, force: true });
  });
});
