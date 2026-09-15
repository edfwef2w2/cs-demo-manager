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

  it('scales during capture when the output size differs', () => {
    expect(
      getCs2HlaeFfmpegPresetOptions({
        videoCodec: 'libx264',
        constantRateFactor: 18,
        outputParameters: '',
        videoContainer: VideoContainer.AVI,
        mirvPovEnabled: false,
        width: 1280,
        height: 960,
        outputWidth: 1920,
        outputHeight: 1080,
        stretchVideo: true,
      }),
    ).toBe(
      '-c:v libx264 -pix_fmt yuv420p -vf scale=1920:1080:flags=lanczos+accurate_rnd+full_chroma_int:force_original_aspect_ratio=disable,setsar=1 -crf 18 {QUOTE}{AFX_STREAM_PATH}\\\\video.avi{QUOTE}',
    );
  });

  it('does not add a second -vf when output parameters already include one', () => {
    expect(
      getCs2HlaeFfmpegPresetOptions({
        videoCodec: 'libx264',
        constantRateFactor: 23,
        outputParameters: '-vf hqdn3d -crf 15',
        videoContainer: VideoContainer.MP4,
        mirvPovEnabled: false,
        width: 1280,
        height: 960,
        outputWidth: 1920,
        outputHeight: 1080,
        stretchVideo: true,
      }),
    ).toBe('-c:v libx264 -pix_fmt yuv420p -vf hqdn3d -crf 15 {QUOTE}{AFX_STREAM_PATH}\\\\video.mp4{QUOTE}');
  });
});
