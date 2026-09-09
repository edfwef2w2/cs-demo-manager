import { listMatchChecksums } from 'csdm/node/store/match-io';

export async function fetchMatchChecksums(): Promise<string[]> {
  await Promise.resolve();
  return listMatchChecksums();
}
