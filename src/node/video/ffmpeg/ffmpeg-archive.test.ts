import { describe, expect, it } from 'vite-plus/test';
import { getFfmpegArchiveUrl } from './ffmpeg-archive';

describe('getFfmpegArchiveUrl', () => {
  it('uses the gyan essentials zip on Windows', () => {
    expect(getFfmpegArchiveUrl('win32', '8.0')).toBe(
      'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip',
    );
  });

  it('uses evermeet on macOS', () => {
    expect(getFfmpegArchiveUrl('darwin', '7.1.1')).toBe('https://evermeet.cx/ffmpeg/ffmpeg-7.1.1.zip');
  });

  it('uses the BtbN linux64 gpl tarball on Linux', () => {
    expect(getFfmpegArchiveUrl('linux', '9.0')).toBe(
      'https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-n9.0-latest-linux64-gpl-9.0.tar.xz',
    );
  });
});
