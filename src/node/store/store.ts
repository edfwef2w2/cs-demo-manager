import path from 'node:path';
import fs from 'fs-extra';
import { DatabaseSchemaVersionMismatch } from 'csdm/node/database/database-schema-version-mismatch-error';
import { createEmptyCatalogs, reviveCatalogDates, type Catalogs } from './catalogs';
import type { MatchIndexRow, PlayerMatchIndexRow, TeamMatchIndexRow } from './index-types';
import {
  type CatalogName,
  getCatalogFilePath,
  getCatalogsFolderPath,
  getDefaultStoreRootPath,
  getDemosFolderPath,
  getIndexesFolderPath,
  getMatchesFolderPath,
  getMatchesIndexFilePath,
  getMetaFilePath,
  getPlayerMatchesIndexFilePath,
  getTeamMatchesIndexFilePath,
} from './paths';
import { readJsonFile, writeJsonAtomic } from './atomic-write';
import { CURRENT_STORE_SCHEMA_VERSION } from './schema-version';
import { seedEmptyCatalogs } from './seed';
import { formatBytes } from './format-bytes';

type StoreMeta = {
  schemaVersion: number;
};

type OpenStoreOptions = {
  rootPath?: string;
};

export type DataStore = {
  rootPath: string;
  catalogs: Catalogs;
  matchIndex: MatchIndexRow[];
  playerMatchIndex: PlayerMatchIndexRow[];
  teamMatchIndex: TeamMatchIndexRow[];
};

let store: DataStore | undefined;
let writeChain = Promise.resolve();

function enqueueWrite<T>(work: () => Promise<T>): Promise<T> {
  const run = writeChain.then(work, work);
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function isStoreOpen() {
  return store !== undefined;
}

export function getStore(): DataStore {
  if (store === undefined) {
    throw new Error('The data store is not open');
  }

  return store;
}

async function loadCatalog<T>(rootPath: string, name: CatalogName, fallback: T): Promise<T> {
  const data = await readJsonFile<T>(getCatalogFilePath(rootPath, name));
  return data ?? fallback;
}

async function persistCatalog(name: CatalogName, data: unknown) {
  const current = getStore();
  await writeJsonAtomic(getCatalogFilePath(current.rootPath, name), data);
}

export async function saveCatalog<K extends keyof Catalogs>(name: K, data: Catalogs[K]) {
  const current = getStore();
  current.catalogs[name] = data;
  await enqueueWrite(async () => {
    await persistCatalog(name, data);
  });
}

export async function updateCatalog<K extends keyof Catalogs>(name: K, updater: (current: Catalogs[K]) => Catalogs[K]) {
  return enqueueWrite(async () => {
    const current = getStore();
    const next = updater(current.catalogs[name]);
    current.catalogs[name] = next;
    await persistCatalog(name, next);
    return next;
  });
}

async function persistIndexes(current: DataStore) {
  await Promise.all([
    writeJsonAtomic(getMatchesIndexFilePath(current.rootPath), current.matchIndex),
    writeJsonAtomic(getPlayerMatchesIndexFilePath(current.rootPath), current.playerMatchIndex),
    writeJsonAtomic(getTeamMatchesIndexFilePath(current.rootPath), current.teamMatchIndex),
  ]);
}

export async function saveIndexes() {
  const current = getStore();
  await enqueueWrite(async () => {
    await persistIndexes(current);
  });
}

export async function replaceMatchIndexRows(parameters: {
  checksum: string;
  match: MatchIndexRow;
  players: PlayerMatchIndexRow[];
  teams: TeamMatchIndexRow[];
}) {
  const current = getStore();
  current.matchIndex = current.matchIndex.filter((row) => row.checksum !== parameters.checksum);
  current.playerMatchIndex = current.playerMatchIndex.filter((row) => row.checksum !== parameters.checksum);
  current.teamMatchIndex = current.teamMatchIndex.filter((row) => row.checksum !== parameters.checksum);
  current.matchIndex.push(parameters.match);
  current.playerMatchIndex.push(...parameters.players);
  current.teamMatchIndex.push(...parameters.teams);
  await saveIndexes();
}

export async function removeMatchIndexRows(checksums: string[]) {
  const checksumSet = new Set(checksums);
  const current = getStore();
  current.matchIndex = current.matchIndex.filter((row) => !checksumSet.has(row.checksum));
  current.playerMatchIndex = current.playerMatchIndex.filter((row) => !checksumSet.has(row.checksum));
  current.teamMatchIndex = current.teamMatchIndex.filter((row) => !checksumSet.has(row.checksum));
  await saveIndexes();
}

async function ensureStoreLayout(rootPath: string) {
  await Promise.all([
    fs.ensureDir(getCatalogsFolderPath(rootPath)),
    fs.ensureDir(getDemosFolderPath(rootPath)),
    fs.ensureDir(getMatchesFolderPath(rootPath)),
    fs.ensureDir(getIndexesFolderPath(rootPath)),
  ]);
}

export async function openStore(options: OpenStoreOptions = {}) {
  const rootPath = options.rootPath ?? getDefaultStoreRootPath();
  await ensureStoreLayout(rootPath);

  const meta = await readJsonFile<StoreMeta>(getMetaFilePath(rootPath));
  const schemaVersion = meta?.schemaVersion ?? 0;
  if (schemaVersion > CURRENT_STORE_SCHEMA_VERSION) {
    throw new DatabaseSchemaVersionMismatch(schemaVersion, CURRENT_STORE_SCHEMA_VERSION);
  }

  const empty = createEmptyCatalogs();
  const catalogs = createEmptyCatalogs();
  catalogs.tags = await loadCatalog(rootPath, 'tags', empty.tags);
  catalogs.maps = await loadCatalog(rootPath, 'maps', empty.maps);
  catalogs.cameras = await loadCatalog(rootPath, 'cameras', empty.cameras);
  catalogs.comments = await loadCatalog(rootPath, 'comments', empty.comments);
  catalogs.playerComments = await loadCatalog(rootPath, 'playerComments', empty.playerComments);
  catalogs.roundComments = await loadCatalog(rootPath, 'roundComments', empty.roundComments);
  catalogs.checksumTags = await loadCatalog(rootPath, 'checksumTags', empty.checksumTags);
  catalogs.roundTags = await loadCatalog(rootPath, 'roundTags', empty.roundTags);
  catalogs.steamAccountTags = await loadCatalog(rootPath, 'steamAccountTags', empty.steamAccountTags);
  catalogs.steamAccounts = await loadCatalog(rootPath, 'steamAccounts', empty.steamAccounts);
  catalogs.steamAccountOverrides = await loadCatalog(rootPath, 'steamAccountOverrides', empty.steamAccountOverrides);
  catalogs.ignoredSteamAccounts = await loadCatalog(rootPath, 'ignoredSteamAccounts', empty.ignoredSteamAccounts);
  catalogs.faceitAccounts = await loadCatalog(rootPath, 'faceitAccounts', empty.faceitAccounts);
  catalogs.faceitMatches = await loadCatalog(rootPath, 'faceitMatches', empty.faceitMatches);
  catalogs.fiveEPlayAccounts = await loadCatalog(rootPath, 'fiveEPlayAccounts', empty.fiveEPlayAccounts);
  catalogs.renownAccounts = await loadCatalog(rootPath, 'renownAccounts', empty.renownAccounts);
  catalogs.downloadHistory = await loadCatalog(rootPath, 'downloadHistory', empty.downloadHistory);
  catalogs.timestamps = await loadCatalog(rootPath, 'timestamps', empty.timestamps);
  catalogs.demoPaths = await loadCatalog(rootPath, 'demoPaths', empty.demoPaths);
  reviveCatalogDates(catalogs);

  const isFresh = schemaVersion === 0 && catalogs.tags.length === 0 && catalogs.maps.length === 0;
  if (isFresh) {
    seedEmptyCatalogs(catalogs);
  }

  const matchIndex = (await readJsonFile<MatchIndexRow[]>(getMatchesIndexFilePath(rootPath))) ?? [];
  const playerMatchIndex = (await readJsonFile<PlayerMatchIndexRow[]>(getPlayerMatchesIndexFilePath(rootPath))) ?? [];
  const teamMatchIndex = (await readJsonFile<TeamMatchIndexRow[]>(getTeamMatchesIndexFilePath(rootPath))) ?? [];

  store = {
    rootPath,
    catalogs,
    matchIndex,
    playerMatchIndex,
    teamMatchIndex,
  };

  if (schemaVersion < CURRENT_STORE_SCHEMA_VERSION) {
    await writeJsonAtomic(getMetaFilePath(rootPath), { schemaVersion: CURRENT_STORE_SCHEMA_VERSION } satisfies StoreMeta);
    if (isFresh) {
      await Promise.all(
        (Object.keys(catalogs) as Array<keyof Catalogs>).map((name) => persistCatalog(name, catalogs[name])),
      );
      await persistIndexes(store);
    }
  }
}

export async function closeStore() {
  store = undefined;
}

export async function resetStore() {
  const current = getStore();
  await fs.remove(current.rootPath);
  store = undefined;
  await openStore({ rootPath: current.rootPath });
}

async function getFolderSize(folderPath: string) {
  if (!(await fs.pathExists(folderPath))) {
    return 0;
  }

  let total = 0;
  const entries = await fs.readdir(folderPath, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(folderPath, entry.name);
    if (entry.isDirectory()) {
      total += await getFolderSize(entryPath);
    } else {
      const stats = await fs.stat(entryPath);
      total += stats.size;
    }
  }

  return total;
}

export async function getStoreSizeLabel() {
  const current = getStore();
  const bytes = await getFolderSize(current.rootPath);
  return formatBytes(bytes);
}
