type RecordingSize = {
  width: number;
  height: number;
  outputWidth?: number;
  outputHeight?: number;
};

export function resolveVideoOutputSize({ width, height, outputWidth, outputHeight }: RecordingSize) {
  return {
    outputWidth: outputWidth && outputWidth > 0 ? outputWidth : width,
    outputHeight: outputHeight && outputHeight > 0 ? outputHeight : height,
  };
}

export function getFfmpegScaleFilter({
  width,
  height,
  outputWidth,
  outputHeight,
  stretchVideo,
}: RecordingSize & { stretchVideo: boolean }): string | undefined {
  const resolved = resolveVideoOutputSize({ width, height, outputWidth, outputHeight });
  if (resolved.outputWidth === width && resolved.outputHeight === height) {
    return undefined;
  }

  const { outputWidth: outW, outputHeight: outH } = resolved;

  // FFmpeg's scale filter preserves the input display aspect ratio by rewriting SAR.
  // 4:3 footage scaled to 16:9 would still play letterboxed unless SAR is reset.
  if (stretchVideo) {
    return `scale=${outW}:${outH}:force_original_aspect_ratio=disable,setsar=1`;
  }

  return `scale=${outW}:${outH}:force_original_aspect_ratio=decrease,pad=${outW}:${outH}:(ow-iw)/2:(oh-ih)/2,setsar=1`;
}
