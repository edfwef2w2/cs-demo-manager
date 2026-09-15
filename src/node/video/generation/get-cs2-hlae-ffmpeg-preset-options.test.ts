import { describe, expect, it } from 'vite-plus/test';
import { VideoContainer } from 'csdm/common/types/video-container';
import { getCs2HlaeFfmpegPresetOptions } from './get-cs2-hlae-ffmpeg-preset-options';

describe('getCs2HlaeFfmpegPresetOptions', () => {
  it('uses the UI codec and CRF and writes to AFX_STREAM_PATH', () => {
    expect(
      getCs2HlaeFfmpegPresetOptions({
        videoCodec: 'libx264',
        constantRateFactor: 18,
        outputParameters: '',
        videoContainer: VideoContainer.AVI,
        mirvPovEnabled: false,
      }),
    ).toBe('-c:v libx264 -pix_fmt yuv420p -crf 18 {QUOTE}{AFX_STREAM_PATH}\\\\video.avi{QUOTE}');
  });

  it('uses mp4 capture for POV so the hook writes a video file', () => {
    expect(
      getCs2HlaeFfmpegPresetOptions({
        videoCodec: 'libx264',
        constantRateFactor: 23,
        outputParameters: '',
        videoContainer: VideoContainer.AVI,
        mirvPovEnabled: true,
      }),
    ).toBe('-c:v libx264 -pix_fmt yuv420p -crf 23 {QUOTE}{AFX_STREAM_PATH}\\\\video.mp4{QUOTE}');
  });

  it('uses custom FFmpeg output parameters instead of CRF', () => {
    expect(
      getCs2HlaeFfmpegPresetOptions({
        videoCodec: 'libx264',
        constantRateFactor: 23,
        outputParameters: '-preset slow -crf 15',
        videoContainer: VideoContainer.MP4,
        mirvPovEnabled: false,
      }),
    ).toBe('-c:v libx264 -pix_fmt yuv420p -preset slow -crf 15 {QUOTE}{AFX_STREAM_PATH}\\\\video.mp4{QUOTE}');
  });
});
