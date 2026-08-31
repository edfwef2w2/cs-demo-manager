import path from 'node:path';
import { getAppFolderPath } from 'csdm/node/filesystem/get-app-folder-path';

const catalogFiles = {
  tags: 'tags.json',
  maps: 'maps.json',
  cameras: 'cameras.json',
  comments: 'comments.json',
  playerComments: 'player-comments.json',
  roundComments: 'round-comments.json',
  checksumTags: 'checksum-tags.json',
  roundTags: 'round-tags.json',
  steamAccountTags: 'steam-account-tags.json',
  steamAccounts: 'steam-accounts.json',
  steamAccountOverrides: 'steam-account-overrides.json',
  ignoredSteamAccounts: 'ignored-steam-accounts.json',
  faceitAccounts: 'faceit-accounts.json',
  faceitMatches: 'faceit-matches.json',
  fiveEPlayAccounts: '5eplay-accounts.json',
  renownAccounts: 'renown-accounts.json',
  downloadHistory: 'download-history.json',
  timestamps: 'timestamps.json',
  demoPaths: 'demo-paths.json',
} as const;

export type CatalogName = keyof typeof catalogFiles;

let storeRootOverride: string | undefined;

export function setStoreRootPathForTests(rootPath: string | undefined) {
  storeRootOverride = rootPath;
}

export function getDefaultStoreRootPath() {
  if (storeRootOverride !== undefined) {
    return storeRootOverride;
  }

  return path.join(getAppFolderPath(), 'store');
}

export function getCatalogsFolderPath(rootPath: string) {
  return path.join(rootPath, 'catalogs');
}

export function getCatalogFilePath(rootPath: string, name: CatalogName) {
  return path.join(getCatalogsFolderPath(rootPath), catalogFiles[name]);
}

export function getDemosFolderPath(rootPath: string) {
  return path.join(rootPath, 'demos');
}

export function getDemoFilePath(rootPath: string, checksum: string) {
  return path.join(getDemosFolderPath(rootPath), `${checksum}.json`);
}

export function getMatchesFolderPath(rootPath: string) {
  return path.join(rootPath, 'matches');
}

export function getMatchFolderPath(rootPath: string, checksum: string) {
  return path.join(getMatchesFolderPath(rootPath), checksum);
}

export function getMatchTempFolderPath(rootPath: string, checksum: string) {
  return path.join(getMatchesFolderPath(rootPath), `${checksum}.tmp`);
}

export function getIndexesFolderPath(rootPath: string) {
  return path.join(rootPath, 'indexes');
}

export function getMatchesIndexFilePath(rootPath: string) {
  return path.join(getIndexesFolderPath(rootPath), 'matches.json');
}

export function getPlayerMatchesIndexFilePath(rootPath: string) {
  return path.join(getIndexesFolderPath(rootPath), 'player-matches.json');
}

export function getTeamMatchesIndexFilePath(rootPath: string) {
  return path.join(getIndexesFolderPath(rootPath), 'team-matches.json');
}

export function getMetaFilePath(rootPath: string) {
  return path.join(rootPath, 'meta.json');
}
