import { listMatchChecksums } from 'csdm/node/store/match-io';

export function fetchMatchChecksums(): Promise<string[]> {
  return listMatchChecksums();
}
