import { handleError } from '../../handle-error';
import { uninstallHlae } from 'csdm/node/video/hlae/uninstall-hlae';

export async function uninstallHlaeHandler() {
  try {
    await uninstallHlae();
  } catch (error) {
    handleError(error, 'Error while uninstalling HLAE');
  }
}
