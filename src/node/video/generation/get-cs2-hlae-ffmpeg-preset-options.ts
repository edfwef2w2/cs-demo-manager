import { VideoContainer } from 'csdm/common/types/video-container';
import { getFfmpegScaleFilter, outputParametersIncludeVideoFilter } from './get-video-output-size';

type Options = {
  videoCodec: string;
  constantRateFactor: number;
  outputParameters: string;
  videoContainer: VideoContainer;
  mirvPovEnabled: boolean;
  width?: number;
  height?: number;
  outputWidth?: number;
  outputHeight?: number;
  stretchVideo?: boolean;
};

/**
 * Output options for `mirv_streams settings add ffmpeg`.
 * Writes into the HLAE take folder via {AFX_STREAM_PATH}. POV capture uses mp4
 * because a hardcoded AVI path does not produce a video file under mirv_pov.
 * Scale is applied here so capture encodes once from raw BGRA instead of
 * stretching a lossy 4:2:0 file in post.
 */
export function getCs2HlaeFfmpegPresetOptions({
  videoCodec,
  constantRateFactor,
  outputParameters,
  videoContainer,
  mirvPovEnabled,
  width = 0,
  height = 0,
  outputWidth,
  outputHeight,
  stretchVideo = false,
}: Options): string {
  const captureContainer = mirvPovEnabled ? VideoContainer.MP4 : videoContainer;
  let options = `-c:v ${videoCodec} -pix_fmt yuv420p`;
  const scaleFilter = getFfmpegScaleFilter({
    width,
    height,
    outputWidth,
    outputHeight,
    stretchVideo,
  });
  if (scaleFilter && !outputParametersIncludeVideoFilter(outputParameters)) {
    options += ` -vf ${scaleFilter}`;
  }
  if (outputParameters === '') {
    options += ` -crf ${constantRateFactor}`;
  } else {
    options += ` ${outputParameters}`;
  }

  return `${options} {QUOTE}{AFX_STREAM_PATH}\\\\video.${captureContainer}{QUOTE}`;
}
