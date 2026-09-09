import { hostagePickUpStartRowToHostagePickUpStart } from './hostage-pick-up-start-row-to-hostage-pick-up-start';
import type { HostagePickUpStartTable } from './hostage-pick-up-start-table';
import type { MatchHostagesDocument } from 'csdm/node/store/match-document';
import { readMatchJson } from 'csdm/node/store/match-io';

export async function fetchHostagesPickUpStart(checksum: string, roundNumber: number) {
  const hostages = await readMatchJson<MatchHostagesDocument>(checksum, 'hostages');
  const rows = ((hostages?.pickUpStart ?? []) as HostagePickUpStartTable[])
    .filter((row) => row.round_number === roundNumber)
    .toSorted((left, right) => left.tick - right.tick);

  const hostagesPickUpStart = rows.map(hostagePickUpStartRowToHostagePickUpStart);

  return hostagesPickUpStart;
}
