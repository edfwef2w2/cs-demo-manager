import { hostagePositionRowToHostagePosition } from './hostage-position-row-to-hostage-position';
import type { HostagePositionTable } from './hostage-position-table';
import { fillMissingTicks } from 'csdm/common/array/fill-missing-ticks';
import { csvColumns, parseCsvFile } from 'csdm/node/store/parse-csv';
import { getMatchPositionFilePath } from 'csdm/node/store/match-io';

function uniqueByTickAndPosition(rows: HostagePositionTable[]) {
  const seen = new Set<string>();
  const unique: HostagePositionTable[] = [];
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

export async function fetchHostagePositions(checksum: string, roundNumber: number) {
  const rows = await parseCsvFile<HostagePositionTable>(
    getMatchPositionFilePath(checksum, 'hostages'),
    csvColumns([
      ['frame', 'number'],
      ['tick', 'number'],
      ['round_number', 'number'],
      ['x', 'number'],
      ['y', 'number'],
      ['z', 'number'],
      ['state', 'number'],
      ['match_checksum', 'string'],
    ]),
  );

  const filtered = uniqueByTickAndPosition(rows.filter((row) => row.round_number === roundNumber))
    .toSorted((left, right) => left.tick - right.tick)
    .map((row, index) => {
      return { ...row, id: index + 1 };
    });

  const positions = fillMissingTicks(filtered.map(hostagePositionRowToHostagePosition));

  return positions;
}
