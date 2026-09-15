import { describe, expect, it } from 'vite-plus/test';
import { VideoContainer } from 'csdm/common/types/video-container';
import { getHlaeVideoCopyArgs } from './get-hlae-video-copy-args';

describe('getHlaeVideoCopyArgs', () => {
  it('rewrites MP4 H.264 into AVI-compatible Annex B', () => {
    expect(
      getHlaeVideoCopyArgs({
        sourcePath: 'D:/take/video.mp4',
        videoContainer: VideoContainer.AVI,
        videoCodec: 'libx264',
        framerate: 120,
      }),
    ).toEqual(['-c copy', '-bsf:v h264_mp4toannexb', '-vtag H264', '-r 120']);
  });

  it('rewrites MP4 HEVC into AVI-compatible Annex B', () => {
    expect(
      getHlaeVideoCopyArgs({
        sourcePath: 'D:/take/video.mp4',
        videoContainer: VideoContainer.AVI,
        videoCodec: 'libx265',
        framerate: 60,
      }),
    ).toEqual(['-c copy', '-bsf:v hevc_mp4toannexb', '-vtag HEVC', '-r 60']);
  });

  it('keeps AVI-to-AVI copies but pins the frame rate', () => {
    expect(
      getHlaeVideoCopyArgs({
        sourcePath: 'D:/take/video.avi',
        videoContainer: VideoContainer.AVI,
        videoCodec: 'libx264',
        framerate: 120,
      }),
    ).toEqual(['-c copy', '-r 120']);
  });

  it('copies MP4 to MP4 without bitstream filters', () => {
    expect(
      getHlaeVideoCopyArgs({
        sourcePath: 'D:/take/video.mp4',
        videoContainer: VideoContainer.MP4,
        videoCodec: 'libx264',
        framerate: 120,
      }),
    ).toEqual(['-c copy']);
  });
});
