export function findFfmpegZipEntryName(entryNames: string[]) {
  const fileNames = entryNames
    .map((name) => name.replaceAll('\\', '/'))
    .filter((name) => !name.endsWith('/'))
    .filter((name) => {
      const baseName = name.split('/').pop();
      return baseName === 'ffmpeg' || baseName === 'ffmpeg.exe';
    });

  const executableInBinFolder = fileNames.find((name) => /(^|\/)bin\/ffmpeg(\.exe)?$/.test(name));
  const entryName = executableInBinFolder ?? fileNames[0];
  if (entryName === undefined) {
    throw new Error('FFmpeg executable not found in archive');
  }

  return entryName;
}
