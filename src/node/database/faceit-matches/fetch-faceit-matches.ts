import { getSettings } from 'csdm/node/settings/get-settings';
import { getStore } from 'csdm/node/store/store';
import { faceitMatchRowToFaceitMatch } from './faceit-match-row-to-faceit-match';

export async function fetchFaceitMatches(ids: string[]) {
  if (ids.length === 0) {
    return [];
  }

  const idSet = new Set(ids);
  const documents = getStore().catalogs.faceitMatches.filter((document) => idSet.has(document.match.id));
  const settings = await getSettings();
  const downloadFolderPath = settings.download.folderPath;

  return Promise.all(
    documents.map((document) =>
      faceitMatchRowToFaceitMatch(document.match, document.players, document.teams, downloadFolderPath),
    ),
  );
}
