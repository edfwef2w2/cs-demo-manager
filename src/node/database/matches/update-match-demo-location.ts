import { getStore, saveIndexes } from 'csdm/node/store/store';
import { readMatchDocument, writeMatchDocument, getOpenedMatchFolderPath } from 'csdm/node/store/match-io';

export async function updateMatchDemoLocation(checksum: string, demoPath: string) {
  const sanitizedDemoPath = demoPath.replaceAll('\\', '/');
  const document = await readMatchDocument(checksum);
  if (document) {
    document.match.demo_path = sanitizedDemoPath;
    await writeMatchDocument(getOpenedMatchFolderPath(checksum), document);
  }

  const indexRow = getStore().matchIndex.find((row) => row.checksum === checksum);
  if (indexRow) {
    indexRow.demoPath = sanitizedDemoPath;
    await saveIndexes();
  }
}
