import { hostagePickedUpRowToHostagePickedUp } from './hostage-picked-up-row-to-hostage-picked-up';
import type { HostagePickedUpTable } from './hostage-picked-up-table';
import type { MatchHostagesDocument } from 'csdm/node/store/match-document';
import { readMatchJson } from 'csdm/node/store/match-io';

export async function fetchHostagesPickedUp(checksum: string, roundNumber: number) {
  const hostages = await readMatchJson<MatchHostagesDocument>(checksum, 'hostages');
  const rows = ((hostages?.pickedUp ?? []) as HostagePickedUpTable[])
    .filter((row) => row.round_number === roundNumber)
    .toSorted((left, right) => left.tick - right.tick);

  const hostagesPickedUp = rows.map(hostagePickedUpRowToHostagePickedUp);

  return hostagesPickedUp;
}
