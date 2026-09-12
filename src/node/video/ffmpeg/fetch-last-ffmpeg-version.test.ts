import { describe, expect, it } from 'vite-plus/test';
import { findVersionFromGitHubLinuxAssets } from './fetch-last-ffmpeg-version';

describe('findVersionFromGitHubLinuxAssets', () => {
  it('returns the highest linux64 gpl version from release assets', () => {
    const version = findVersionFromGitHubLinuxAssets([
      { name: 'ffmpeg-n7.1-latest-linux64-gpl-7.1.tar.xz' },
      { name: 'ffmpeg-n9.0-latest-win64-gpl-9.0.zip' },
      { name: 'ffmpeg-n8.0-latest-linux64-gpl-8.0.tar.xz' },
      { name: 'ffmpeg-n9.0-latest-linux64-gpl-9.0.tar.xz' },
    ]);

    expect(version).toBe('9.0');
  });

  it('throws when no linux64 gpl archive is present', () => {
    expect(() => {
      findVersionFromGitHubLinuxAssets([{ name: 'ffmpeg-n9.0-latest-win64-gpl-9.0.zip' }]);
    }).toThrow('FFMpeg version not found');
  });
});
