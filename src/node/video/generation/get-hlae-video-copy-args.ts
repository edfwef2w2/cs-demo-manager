import path from 'node:path';
import { VideoContainer } from 'csdm/common/types/video-container';

type Options = {
  sourcePath: string;
  videoContainer: VideoContainer;
  videoCodec: string;
  framerate: number;
};

function isHevcCodec(videoCodec: string) {
  const codec = videoCodec.toLowerCase();
  return codec.includes('265') || codec.includes('hevc');
}

/**
 * Stream-copy args for HLAE captures that are already encoded.
 * POV writes MP4 (avc1). Copying that bitstream into AVI leaves FourCC avc1,
 * which many players play as audio-only.
 */
export function getHlaeVideoCopyArgs({ sourcePath, videoContainer, videoCodec, framerate }: Options): string[] {
  const args = ['-c copy'];
  const sourceExt = path.extname(sourcePath).slice(1).toLowerCase();

  if (videoContainer === VideoContainer.AVI && sourceExt !== VideoContainer.AVI) {
    if (isHevcCodec(videoCodec)) {
      args.push('-bsf:v hevc_mp4toannexb', '-vtag HEVC');
    } else {
      args.push('-bsf:v h264_mp4toannexb', '-vtag H264');
    }
  }

  if (videoContainer === VideoContainer.AVI) {
    args.push(`-r ${framerate}`);
  }

  return args;
}
