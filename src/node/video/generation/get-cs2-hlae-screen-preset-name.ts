import { EncoderSoftware } from 'csdm/common/types/encoder-software';
import { RecordingOutput } from 'csdm/common/types/recording-output';

export const CS2_HLAE_CLASSIC_PRESET = 'afxClassic';

type Options = {
  recordingOutput: RecordingOutput;
  encoderSoftware: EncoderSoftware;
  sequenceNumber: number;
};

/**
 * HLAE screen recording preset for CS2.
 * Video + FFmpeg uses a custom csdmPreset so capture follows the UI codec/CRF.
 */
export function getCs2HlaeScreenPresetName({ recordingOutput, encoderSoftware, sequenceNumber }: Options): string {
  if (recordingOutput !== RecordingOutput.Video || encoderSoftware !== EncoderSoftware.FFmpeg) {
    return CS2_HLAE_CLASSIC_PRESET;
  }

  return `csdmPreset${sequenceNumber}`;
}

export function isCustomCs2HlaeFfmpegPreset(presetName: string): boolean {
  return presetName.startsWith('csdmPreset');
}
