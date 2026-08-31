import { WatchType } from 'csdm/common/types/watch-type';
import { getDemoChecksumFromDemoPath } from 'csdm/node/demo/get-demo-checksum-from-demo-path';
import { readMatchDocument, readMatchEvents } from 'csdm/node/store/match-io';
import type { KillRow } from '../kills/kill-table';
import type { DamageTable } from '../damages/damage-table';

export type Action = {
  tick: number;
  roundNumber: number;
  // We use players slots for CS2 rather than Steam IDs because the command spec_lock_to_accountid doesn't work when the
  // current logged in Steam account is the player that you would like to focus on with non Valve demos.
  // See https://github.com/akiver/cs-demo-manager/issues/775
  // Fields can be null because it may be an action caused by the "world".
  // In such case, the camera will be focused on the focused player whatever the perspective is.
  playerSlot: number | null;
  playerSteamId: string | null;
  opponentSlot: number | null;
  opponentSteamId: string | null;
};

export type PlaybackMatch = {
  checksum: string;
  demoPath: string;
  tickCount: number;
  tickrate: number;
  actions: Action[];
};

async function fetchKills(checksum: string, steamId: string, type: WatchType): Promise<Action[]> {
  const document = await readMatchDocument(checksum);
  const slotBySteamId = new Map((document?.players ?? []).map((player) => [player.steam_id, player.index]));
  const kills = await readMatchEvents<KillRow>(checksum, 'kills');

  return kills
    .filter((kill) => {
      if (type === WatchType.Highlights) {
        return kill.killer_steam_id === steamId && kill.victim_steam_id !== steamId;
      }
      return kill.victim_steam_id === steamId && kill.killer_steam_id !== steamId;
    })
    .slice()
    .sort((left, right) => left.tick - right.tick)
    .map((kill) => {
      const playerSteamId = type === WatchType.Highlights ? kill.killer_steam_id : kill.victim_steam_id;
      const opponentSteamId = type === WatchType.Highlights ? kill.victim_steam_id : kill.killer_steam_id;
      return {
        tick: kill.tick,
        roundNumber: kill.round_number,
        playerSteamId,
        opponentSteamId,
        playerSlot: slotBySteamId.get(playerSteamId) ?? null,
        opponentSlot: slotBySteamId.get(opponentSteamId) ?? null,
      };
    });
}

async function fetchDamages(checksum: string, steamId: string, type: WatchType): Promise<Action[]> {
  const document = await readMatchDocument(checksum);
  const slotBySteamId = new Map((document?.players ?? []).map((player) => [player.steam_id, player.index]));
  const damages = await readMatchEvents<DamageTable>(checksum, 'damages');

  return damages
    .filter((damage) => {
      if (damage.health_damage < 40 || damage.victim_new_health <= 0) {
        return false;
      }
      if (type === WatchType.Highlights) {
        return damage.attacker_steam_id === steamId && damage.victim_steam_id !== steamId;
      }
      return damage.victim_steam_id === steamId && damage.attacker_steam_id !== steamId;
    })
    .slice()
    .sort((left, right) => left.tick - right.tick)
    .map((damage) => {
      const playerSteamId = type === WatchType.Highlights ? damage.attacker_steam_id : damage.victim_steam_id;
      const opponentSteamId = type === WatchType.Highlights ? damage.victim_steam_id : damage.attacker_steam_id;
      return {
        tick: damage.tick,
        roundNumber: damage.round_number,
        playerSteamId,
        opponentSteamId,
        playerSlot: slotBySteamId.get(playerSteamId) ?? null,
        opponentSlot: slotBySteamId.get(opponentSteamId) ?? null,
      };
    });
}

type Options = {
  demoPath: string;
  steamId: string;
  type: WatchType;
  includeDamages: boolean;
};

export async function getPlaybackMatch({ demoPath, steamId, type, includeDamages }: Options) {
  const checksum = await getDemoChecksumFromDemoPath(demoPath);
  const document = await readMatchDocument(checksum);
  if (!document) {
    return undefined;
  }

  let actions: Action[] = [];
  if (includeDamages) {
    const [kills, damages] = await Promise.all([
      fetchKills(checksum, steamId, type),
      fetchDamages(checksum, steamId, type),
    ]);
    actions = [...kills, ...damages].sort((left, right) => left.tick - right.tick);
  } else {
    actions = await fetchKills(checksum, steamId, type);
  }

  return {
    checksum: document.demo.checksum,
    tickrate: document.demo.tickrate,
    tickCount: document.demo.tick_count,
    demoPath,
    actions,
  } satisfies PlaybackMatch;
}
