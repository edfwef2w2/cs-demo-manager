import path from 'node:path';
import fs from 'fs-extra';
import { getMatchFolderPath } from './paths';
import { getStore } from './store';
import { readJsonFile, writeJsonAtomic } from './atomic-write';
import { matchEventFiles, positionCsvFiles, type MatchDocument, type MatchEventName, type PositionCsvName } from './match-document';

export function getOpenedMatchFolderPath(checksum: string) {
  return getMatchFolderPath(getStore().rootPath, checksum);
}

export function getMatchEventFilePath(checksum: string, eventName: MatchEventName) {
  return path.join(getOpenedMatchFolderPath(checksum), matchEventFiles[eventName]);
}

export function getMatchPositionFilePath(checksum: string, name: PositionCsvName) {
  return path.join(getOpenedMatchFolderPath(checksum), 'positions', positionCsvFiles[name]);
}

export function getMatchDocumentPath(checksum: string) {
  return path.join(getOpenedMatchFolderPath(checksum), 'match.json');
}

export async function readMatchDocument(checksum: string) {
  const document = await readJsonFile<MatchDocument>(getMatchDocumentPath(checksum));
  if (document === undefined) {
    return undefined;
  }

  document.demo.date = new Date(document.demo.date);
  document.match.analyze_date = new Date(document.match.analyze_date);
  return document;
}

export async function writeMatchDocument(folderPath: string, document: MatchDocument) {
  await writeJsonAtomic(path.join(folderPath, 'match.json'), document);
}

export async function readMatchJson<T>(checksum: string, eventName: MatchEventName): Promise<T | undefined> {
  return readJsonFile<T>(getMatchEventFilePath(checksum, eventName));
}

export async function readMatchEvents<T>(checksum: string, eventName: MatchEventName): Promise<T[]> {
  const rows = await readJsonFile<T[]>(getMatchEventFilePath(checksum, eventName));
  return rows ?? [];
}

export async function writeMatchEvents(folderPath: string, eventName: MatchEventName, rows: unknown[]) {
  await writeJsonAtomic(path.join(folderPath, matchEventFiles[eventName]), rows);
}

export async function matchFolderExists(checksum: string) {
  return fs.pathExists(getOpenedMatchFolderPath(checksum));
}

export async function listMatchChecksums() {
  const current = getStore();
  return current.matchIndex.map((row) => row.checksum);
}
