import fs from 'fs-extra';

const UNCOMPRESSED_FOURCCS = new Set(['DIB ', 'RAW ', 'RGB ', 'RGBA', '    ']);

function normalizeFourcc(value: string): string {
  return value.replaceAll('\0', ' ').toUpperCase();
}

export function isUncompressedAviVideoBuffer(data: Buffer): boolean {
  if (data.length < 12) {
    return false;
  }

  if (data.toString('ascii', 0, 4) !== 'RIFF' || data.toString('ascii', 8, 12) !== 'AVI ') {
    return false;
  }

  const marker = Buffer.from('strh');
  let index = data.indexOf(marker);
  while (index !== -1) {
    if (index + 16 <= data.length && data.toString('ascii', index + 8, index + 12) === 'vids') {
      const fccHandler = normalizeFourcc(data.toString('ascii', index + 12, index + 16));
      return UNCOMPRESSED_FOURCCS.has(fccHandler);
    }

    index = data.indexOf(marker, index + 1);
  }

  return false;
}

export async function isUncompressedAviVideo(filePath: string): Promise<boolean> {
  const fd = await fs.open(filePath, 'r');
  try {
    const header = Buffer.alloc(65_536);
    await fs.read(fd, header, 0, header.length, 0);
    return isUncompressedAviVideoBuffer(header);
  } finally {
    await fs.close(fd);
  }
}
