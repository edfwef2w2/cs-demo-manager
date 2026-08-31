import type { TeamNumber } from 'csdm/common/types/counter-strike';
import { readMatchEvents } from 'csdm/node/store/match-io';
import type { KillRow as KillTableRow } from '../kills/kill-table';

export type KillRow = {
  matchChecksum: string;
  roundNumber: number;
  tick: number;
  frame: number;
  killerSteamId: string;
  killerName: string;
  killerSide: TeamNumber;
  victimSteamId: string;
  victimName: string;
  victimSide: TeamNumber;
  assisterSteamId: string;
  assisterName: string | null;
  assisterSide: TeamNumber;
  weaponName: string;
  isHeadshot: boolean;
  isAssistedFlash: boolean;
  isTradeKill: boolean;
  isTradeDeath: boolean;
  isThroughSmoke: boolean;
  isKillerAirborne: boolean;
  isVictimAirborne: boolean;
  isKillerBlinded: boolean;
  isVictimBlinded: boolean;
  isNoScope: boolean;
  distance: number;
  penetratedObjects: number;
  killerX: number;
  killerY: number;
  killerZ: number;
  victimX: number;
  victimY: number;
  victimZ: number;
  assisterX: number;
  assisterY: number;
  assisterZ: number;
  isKillerControllingBot: boolean;
  isVictimControllingBot: boolean;
  isAssisterControllingBot: boolean;
};

export async function fetchKillsRows(checksums: string[]) {
  const rows: KillRow[] = [];
  for (const checksum of checksums) {
    const kills = await readMatchEvents<KillTableRow>(checksum, 'kills');
    for (const kill of kills) {
      rows.push({
        matchChecksum: checksum,
        roundNumber: kill.round_number,
        tick: kill.tick,
        frame: kill.frame,
        killerSteamId: kill.killer_steam_id,
        killerName: kill.killer_name,
        killerSide: kill.killer_side,
        victimSteamId: kill.victim_steam_id,
        victimName: kill.victim_name,
        victimSide: kill.victim_side,
        assisterSteamId: kill.assister_steam_id,
        assisterName: kill.assister_name,
        assisterSide: kill.assister_side,
        weaponName: kill.weapon_name,
        isHeadshot: kill.is_headshot,
        isAssistedFlash: kill.is_assisted_flash,
        isTradeKill: kill.is_trade_kill,
        isTradeDeath: kill.is_trade_death,
        isThroughSmoke: kill.is_through_smoke,
        isKillerAirborne: kill.is_killer_airborne,
        isVictimAirborne: kill.is_victim_airborne,
        isKillerBlinded: kill.is_killer_blinded,
        isVictimBlinded: kill.is_victim_blinded,
        isNoScope: kill.is_no_scope,
        distance: kill.distance,
        penetratedObjects: kill.penetrated_objects,
        killerX: kill.killer_x,
        killerY: kill.killer_y,
        killerZ: kill.killer_z,
        victimX: kill.victim_x,
        victimY: kill.victim_y,
        victimZ: kill.victim_z,
        assisterX: kill.assister_x,
        assisterY: kill.assister_y,
        assisterZ: kill.assister_z,
        isKillerControllingBot: kill.is_killer_controlling_bot,
        isVictimControllingBot: kill.is_victim_controlling_bot,
        isAssisterControllingBot: kill.is_assister_controlling_bot,
      });
    }
  }

  return rows;
}
