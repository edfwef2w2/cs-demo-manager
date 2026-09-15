import { describe, expect, it } from 'vite-plus/test';
import { isUncompressedAviVideoBuffer } from './is-uncompressed-avi-video';

function aviWithVideoHandler(fourcc: string): Buffer {
  const header = Buffer.alloc(64);
  header.write('RIFF', 0, 4, 'ascii');
  header.writeUInt32LE(56, 4);
  header.write('AVI ', 8, 4, 'ascii');
  header.write('strh', 12, 4, 'ascii');
  header.writeUInt32LE(16, 16);
  header.write('vids', 20, 4, 'ascii');
  header.write(fourcc, 24, 4, 'ascii');
  return header;
}

describe('isUncompressedAviVideoBuffer', () => {
  it('detects uncompressed AVI fourccs', () => {
    expect(isUncompressedAviVideoBuffer(aviWithVideoHandler('DIB '))).toBe(true);
    expect(isUncompressedAviVideoBuffer(aviWithVideoHandler('raw '))).toBe(true);
    expect(isUncompressedAviVideoBuffer(aviWithVideoHandler('\0\0\0\0'))).toBe(true);
  });

  it('does not treat compressed AVI or non-AVI as uncompressed', () => {
    expect(isUncompressedAviVideoBuffer(aviWithVideoHandler('H264'))).toBe(false);
    expect(isUncompressedAviVideoBuffer(aviWithVideoHandler('x264'))).toBe(false);
    expect(isUncompressedAviVideoBuffer(Buffer.from('ftypisom'))).toBe(false);
  });
});
