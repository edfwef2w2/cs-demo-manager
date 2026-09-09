import type { InfernoPosition } from 'csdm/common/types/inferno-position';
import { infernoPositionRowToInfernoPosition } from './inferno-position-row-to-inferno-position';
import type { InfernoPositionTable } from './inferno-position-table';
import { fillMissingTicks } from 'csdm/common/array/fill-missing-ticks';
import { csvColumns, parseCsvFile } from 'csdm/node/store/parse-csv';
import { getMatchPositionFilePath } from 'csdm/node/store/match-io';

function uniqueByTickAndId(rows: InfernoPositionTable[]) {
  const seen = new Set<string>();
  const unique: InfernoPositionTable[] = [];
  for (const row of rows) {
    const key = `${row.tick}:${row.unique_id}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(row);
  }
  return unique;
}

export async function fetchInfernoPositions(checksum: string, roundNumber: number) {
  const rows = await parseCsvFile<InfernoPositionTable>(
    getMatchPositionFilePath(checksum, 'infernos'),
    csvColumns([
      ['frame', 'number'],
      ['tick', 'number'],
      ['round_number', 'number'],
      ['thrower_steam_id', 'string'],
      ['thrower_name', 'string'],
      ['unique_id', 'string'],
      ['x', 'number'],
      ['y', 'number'],
      ['z', 'number'],
      ['convex_hull_2d', 'string'],
      ['match_checksum', 'string'],
    ]),
  );

  const filtered = uniqueByTickAndId(rows.filter((row) => row.round_number === roundNumber))
    .toSorted((left, right) => left.tick - right.tick)
    .map((row, index) => {
      return { ...row, id: index + 1 };
    });

  const infernoPositions: InfernoPosition[] = fillMissingTicks(filtered.map(infernoPositionRowToInfernoPosition));

  return infernoPositions;
}
