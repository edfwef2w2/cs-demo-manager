import { isMac } from 'csdm/node/os/is-mac';
import { isWindows } from 'csdm/node/os/is-windows';

type EvermeetResponse = {
  version: string;
};

export function findVersionFromGitHubLinuxAssets(assets: Array<{ name: string }>) {
  let versionsFound: string[] = [];
  for (const asset of assets) {
    const regex = /ffmpeg-n.*-latest-linux64-gpl-(\d+\.\d+(?:\.\d+)?)\.tar\.xz/g;
    const matches = regex.exec(asset.name);
    if (matches !== null) {
      versionsFound = [...versionsFound, matches[1]];
    }
  }

  if (versionsFound.length === 0) {
    throw new Error('FFMpeg version not found');
  }

  return versionsFound.sort().reverse()[0];
}

export async function fetchLastFfmpegVersion(): Promise<string> {
  if (isWindows) {
    const response = await fetch('https://www.gyan.dev/ffmpeg/builds/release-version', {
      headers: {
        'User-Agent': 'CS:DM',
      },
    });
    const version = (await response.text()).trim();
    if (version === '') {
      throw new Error('FFMpeg version not found');
    }

    return version;
  }

  if (isMac) {
    const response = await fetch('https://evermeet.cx/ffmpeg/info/ffmpeg/release');
    const data: EvermeetResponse = await response.json();
    return data.version;
  }

  const response = await fetch('https://api.github.com/repos/BtbN/FFmpeg-Builds/releases/latest');
  const release: GitHubReleaseResponse = await response.json();
  return findVersionFromGitHubLinuxAssets(release.assets);
}
