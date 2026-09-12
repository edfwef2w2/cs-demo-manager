import { describe, expect, it } from 'vite-plus/test';
import { findFfmpegZipEntryName } from './find-ffmpeg-zip-entry-name';

describe('findFfmpegZipEntryName', () => {
  it('prefers the binary inside bin over other ffmpeg files', () => {
    const entryName = findFfmpegZipEntryName([
      'ffmpeg-8.0-essentials_build/README.txt',
      'ffmpeg-8.0-essentials_build/bin/ffplay.exe',
      'ffmpeg-8.0-essentials_build/bin/ffmpeg.exe',
      'ffmpeg-8.0-essentials_build/bin/ffprobe.exe',
    ]);

    expect(entryName).toBe('ffmpeg-8.0-essentials_build/bin/ffmpeg.exe');
  });

  it('finds a root ffmpeg binary used by macOS archives', () => {
    const entryName = findFfmpegZipEntryName(['README.txt', 'ffmpeg']);

    expect(entryName).toBe('ffmpeg');
  });

  it('normalizes Windows path separators', () => {
    const entryName = findFfmpegZipEntryName(['ffmpeg-8.0-essentials_build\\bin\\ffmpeg.exe']);

    expect(entryName).toBe('ffmpeg-8.0-essentials_build/bin/ffmpeg.exe');
  });

  it('throws when the archive does not contain ffmpeg', () => {
    expect(() => {
      findFfmpegZipEntryName(['bin/ffplay.exe', 'doc/readme.txt']);
    }).toThrow('FFmpeg executable not found in archive');
  });
});
