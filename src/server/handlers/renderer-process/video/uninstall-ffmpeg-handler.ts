import { handleError } from '../../handle-error';
import { uninstallFfmpeg } from 'csdm/node/video/ffmpeg/uninstall-ffmpeg';

export async function uninstallFfmpegHandler() {
  try {
    await uninstallFfmpeg();
  } catch (error) {
    handleError(error, 'Error while uninstalling FFmpeg');
  }
}
