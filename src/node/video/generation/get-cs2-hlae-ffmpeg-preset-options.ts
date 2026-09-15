import { VideoContainer } from 'csdm/common/types/video-container';

type Options = {
  videoCodec: string;
  constantRateFactor: number;
  outputParameters: string;
  videoContainer: VideoContainer;
  mirvPovEnabled: boolean;
};

/**
 * Output options for `mirv_streams settings add ffmpeg`.
 * Writes into the HLAE take folder via {AFX_STREAM_PATH}. POV capture uses mp4
 * because a hardcoded AVI path does not produce a video file under mirv_pov.
 */
export function getCs2HlaeFfmpegPresetOptions({
  videoCodec,
  constantRateFactor,
  outputParameters,
  videoContainer,
  mirvPovEnabled,
}: Options): string {
  const captureContainer = mirvPovEnabled ? VideoContainer.MP4 : videoContainer;
  let options = `-c:v ${videoCodec} -pix_fmt yuv420p`;
  if (outputParameters === '') {
    options += ` -crf ${constantRateFactor}`;
  } else {
    options += ` ${outputParameters}`;
  }

  return `${options} {QUOTE}{AFX_STREAM_PATH}\\\\video.${captureContainer}{QUOTE}`;
}
