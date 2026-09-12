import { Readable } from 'node:stream';
import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { request } from 'undici';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { downloadFile } from './download-file';

vi.mock('undici', () => {
  return {
    request: vi.fn(),
    Agent: class {
      compose() {
        return this;
      }
    },
    interceptors: {
      redirect: () => ({}),
    },
  };
});

const mockedRequest = vi.mocked(request);

describe('downloadFile', () => {
  beforeEach(() => {
    vi.stubGlobal('logger', {
      debug: vi.fn(),
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      getLogFilePath: vi.fn(),
      clear: vi.fn(),
    });
  });

  it('writes the response body when the status is 200', async () => {
    const folderPath = await fs.mkdtemp(path.join(os.tmpdir(), 'ffmpeg-dl-'));
    const destinationPath = path.join(folderPath, 'file.bin');
    mockedRequest.mockResolvedValue({
      statusCode: 200,
      headers: { 'content-length': '5' },
      body: Readable.from(['hello']),
    } as never);

    await downloadFile('https://example.com/file.bin', destinationPath);

    expect(mockedRequest).toHaveBeenCalledWith('https://example.com/file.bin', {
      dispatcher: expect.anything(),
      headersTimeout: 30_000,
      bodyTimeout: 120_000,
    });
    expect(await fs.readFile(destinationPath, 'utf8')).toBe('hello');
    await fs.remove(folderPath);
  });

  it('throws when the status is not 200', async () => {
    const resume = vi.fn();
    mockedRequest.mockResolvedValue({
      statusCode: 404,
      headers: {},
      body: { resume },
    } as never);

    await expect(
      downloadFile('https://example.com/missing.bin', path.join(os.tmpdir(), 'missing.bin')),
    ).rejects.toThrow('Failed to download file (status 404)');
    expect(resume).toHaveBeenCalledTimes(1);
  });
});
