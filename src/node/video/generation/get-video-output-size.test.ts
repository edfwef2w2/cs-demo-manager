import { describe, expect, it } from 'vite-plus/test';
import { getFfmpegScaleFilter, resolveVideoOutputSize } from './get-video-output-size';

describe('resolveVideoOutputSize', () => {
  it('uses the recording size when output size is unset', () => {
    expect(resolveVideoOutputSize({ width: 1280, height: 960, outputWidth: 0, outputHeight: 0 })).toEqual({
      outputWidth: 1280,
      outputHeight: 960,
    });
  });

  it('uses an explicit output size', () => {
    expect(resolveVideoOutputSize({ width: 1280, height: 960, outputWidth: 1920, outputHeight: 1080 })).toEqual({
      outputWidth: 1920,
      outputHeight: 1080,
    });
  });
});

describe('getFfmpegScaleFilter', () => {
  it('returns undefined when the output size matches the recording size', () => {
    expect(
      getFfmpegScaleFilter({
        width: 1920,
        height: 1080,
        outputWidth: 0,
        outputHeight: 0,
        stretchVideo: true,
      }),
    ).toBeUndefined();
  });

  it('stretches to the output size when stretch is enabled', () => {
    expect(
      getFfmpegScaleFilter({
        width: 1280,
        height: 960,
        outputWidth: 1920,
        outputHeight: 1080,
        stretchVideo: true,
      }),
    ).toBe('scale=1920:1080:force_original_aspect_ratio=disable,setsar=1');
  });

  it('letterboxes when stretch is disabled', () => {
    expect(
      getFfmpegScaleFilter({
        width: 1280,
        height: 960,
        outputWidth: 1920,
        outputHeight: 1080,
        stretchVideo: false,
      }),
    ).toBe('scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1');
  });
});
