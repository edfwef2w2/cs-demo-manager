import { chickenPositionRowToChickenPosition } from './chicken-position-row-to-chicken-position';
import type { ChickenPositionTable } from './chicken-position-table';
import { fillMissingTicks } from 'csdm/common/array/fill-missing-ticks';
import { csvColumns, parseCsvFile } from 'csdm/node/store/parse-csv';
import { getMatchPositionFilePath } from 'csdm/node/store/match-io';

function uniqueByTickAndPosition(rows: ChickenPositionTable[]) {
  const seen = new Set<string>();
  const unique: ChickenPositionTable[] = [];
  for (const row of rows) {
    const key = `${row.tick}:${row.x}:${row.y}:${row.z}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(row);
  }
  return unique;
}

export async function fetchChickenPositions(checksum: string, roundNumber: number) {
  const rows = await parseCsvFile<ChickenPositionTable>(
    getMatchPositionFilePath(checksum, 'chickens'),
    csvColumns([
      ['frame', 'number'],
      ['tick', 'number'],
      ['round_number', 'number'],
      ['x', 'number'],
      ['y', 'number'],
      ['z', 'number'],
      ['match_checksum', 'string'],
    ]),
  );

  const filtered = uniqueByTickAndPosition(rows.filter((row) => row.round_number === roundNumber))
    .slice()
    .sort((left, right) => left.tick - right.tick)
    .map((row, index) => {
      return { ...row, id: index + 1 };
    });

  const positions = fillMissingTicks(filtered.map(chickenPositionRowToChickenPosition));

  return positions;
}
