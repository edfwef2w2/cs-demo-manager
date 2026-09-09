import { getDefaultCameras } from 'csdm/node/database/cameras/insert-default-cameras';
import { getDefaultMaps } from 'csdm/node/database/maps/default-maps';
import type { MapRow } from 'csdm/node/database/maps/map-table';
import type { TagRow } from 'csdm/node/database/tags/tag-table';
import type { Catalogs } from './catalogs';

function getDefaultTags(): TagRow[] {
  return [
    {
      id: 1,
      name: 'To watch',
      color: '#f29423',
    },
    {
      id: 2,
      name: 'Watched',
      color: '#33ab84',
    },
  ];
}

export function seedEmptyCatalogs(catalogs: Catalogs) {
  catalogs.tags = getDefaultTags();
  catalogs.maps = getDefaultMaps().map((map, index) => {
    const row: MapRow = {
      id: index + 1,
      name: map.name,
      game: map.game,
      position_x: map.position_x,
      position_y: map.position_y,
      threshold_z: map.threshold_z,
      scale: map.scale,
    };
    return row;
  });
  catalogs.cameras = getDefaultCameras();
}
