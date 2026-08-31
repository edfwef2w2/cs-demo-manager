import { deleteCameraPreviewFile } from 'csdm/node/filesystem/cameras/delete-camera-preview-file';
import { updateCatalog } from 'csdm/node/store/store';

export async function deleteCamera(cameraId: string) {
  await updateCatalog('cameras', (current) => current.filter((row) => String(row.id) !== cameraId));
  await deleteCameraPreviewFile(cameraId);
}
