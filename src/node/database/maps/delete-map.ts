import { deleteMapImageFiles } from 'csdm/node/filesystem/maps/delete-map-image-files';
import type { Map } from 'csdm/common/types/map';
import { updateCatalog } from 'csdm/node/store/store';

export async function deleteMap(map: Map) {
  await updateCatalog('maps', (current) => current.filter((row) => String(row.id) !== map.id));
  await deleteMapImageFiles(map);
}
