export type FfmpegArchivePlatform = 'win32' | 'darwin' | 'linux';

export function getFfmpegArchiveUrl(platform: FfmpegArchivePlatform, version: string) {
  switch (platform) {
    case 'darwin':
      return `https://evermeet.cx/ffmpeg/ffmpeg-${version}.zip`;
    case 'win32':
      return 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip';
    default:
      return `https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-n${version}-latest-linux64-gpl-${version}.tar.xz`;
  }
}

export function getFfmpegArchivePlatform(): FfmpegArchivePlatform {
  switch (process.platform) {
    case 'win32':
    case 'darwin':
      return process.platform;
    default:
      return 'linux';
  }
}
