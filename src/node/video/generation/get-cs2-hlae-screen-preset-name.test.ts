import { describe, expect, it } from 'vite-plus/test';
import { EncoderSoftware } from 'csdm/common/types/encoder-software';
import { RecordingOutput } from 'csdm/common/types/recording-output';
import {
  CS2_HLAE_CLASSIC_PRESET,
  getCs2HlaeScreenPresetName,
  isCustomCs2HlaeFfmpegPreset,
} from './get-cs2-hlae-screen-preset-name';

describe('getCs2HlaeScreenPresetName', () => {
  it('uses a custom ffmpeg preset for video output', () => {
    expect(
      getCs2HlaeScreenPresetName({
        recordingOutput: RecordingOutput.Video,
        encoderSoftware: EncoderSoftware.FFmpeg,
        sequenceNumber: 2,
      }),
    ).toBe('csdmPreset2');
  });

  it('uses a custom ffmpeg preset for POV video output', () => {
    expect(
      getCs2HlaeScreenPresetName({
        recordingOutput: RecordingOutput.Video,
        encoderSoftware: EncoderSoftware.FFmpeg,
        sequenceNumber: 1,
      }),
    ).toBe('csdmPreset1');
  });

  it('uses afxClassic for image output', () => {
    expect(
      getCs2HlaeScreenPresetName({
        recordingOutput: RecordingOutput.Images,
        encoderSoftware: EncoderSoftware.FFmpeg,
        sequenceNumber: 1,
      }),
    ).toBe(CS2_HLAE_CLASSIC_PRESET);
    expect(
      getCs2HlaeScreenPresetName({
        recordingOutput: RecordingOutput.ImagesAndVideo,
        encoderSoftware: EncoderSoftware.FFmpeg,
        sequenceNumber: 1,
      }),
    ).toBe(CS2_HLAE_CLASSIC_PRESET);
  });

  it('uses afxClassic when the encoder is not FFmpeg', () => {
    expect(
      getCs2HlaeScreenPresetName({
        recordingOutput: RecordingOutput.Video,
        encoderSoftware: EncoderSoftware.VirtualDub,
        sequenceNumber: 1,
      }),
    ).toBe(CS2_HLAE_CLASSIC_PRESET);
  });
});

describe('isCustomCs2HlaeFfmpegPreset', () => {
  it('detects csdm ffmpeg presets', () => {
    expect(isCustomCs2HlaeFfmpegPreset('csdmPreset1')).toBe(true);
    expect(isCustomCs2HlaeFfmpegPreset('afxFfmpegYuv420p')).toBe(false);
    expect(isCustomCs2HlaeFfmpegPreset(CS2_HLAE_CLASSIC_PRESET)).toBe(false);
  });
});
