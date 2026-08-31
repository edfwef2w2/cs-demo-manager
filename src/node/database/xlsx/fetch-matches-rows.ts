import { getStore } from 'csdm/node/store/store';
import { readMatchEvents, readMatchJson } from 'csdm/node/store/match-io';
import type { MatchBombsDocument } from 'csdm/node/store/match-document';
import type { ClutchRow } from '../clutches/clutch-table';

export type MatchRow = {
  checksum: string;
  name: string;
  demoPath: string;
  date: Date;
  source: string;
  mapName: string;
  serverName: string;
  clientName: string;
  duration: number;
  tickrate: number;
  tickCount: number;
  frameRate: number;
  nameTeamA: string;
  nameTeamB: string;
  scoreTeamA: number;
  scoreTeamB: number;
  killCount: number;
  assistCount: number;
  deathCount: number;
  bombPlantedCount: number;
  bombDefusedCount: number;
  clutchCount: number;
};

export async function fetchMatchesRows(checksums: string[]) {
  const checksumSet = new Set(checksums);
  const rows: MatchRow[] = [];
  for (const match of getStore().matchIndex) {
    if (!checksumSet.has(match.checksum)) {
      continue;
    }
    const [bombs, clutches] = await Promise.all([
      readMatchJson<MatchBombsDocument>(match.checksum, 'bombs'),
      readMatchEvents<ClutchRow>(match.checksum, 'clutches'),
    ]);
    rows.push({
      checksum: match.checksum,
      name: match.name,
      demoPath: match.demoPath,
      date: new Date(match.date),
      source: match.source,
      mapName: match.mapName,
      serverName: match.serverName,
      clientName: match.clientName,
      duration: match.duration,
      tickrate: match.tickrate,
      tickCount: match.tickCount,
      frameRate: match.framerate,
      nameTeamA: match.teamAName,
      nameTeamB: match.teamBName,
      scoreTeamA: match.teamAScore,
      scoreTeamB: match.teamBScore,
      killCount: match.killCount,
      assistCount: match.assistCount,
      deathCount: match.deathCount,
      bombPlantedCount: bombs?.planted.length ?? 0,
      bombDefusedCount: bombs?.defused.length ?? 0,
      clutchCount: clutches.length,
    });
  }

  return rows;
}
