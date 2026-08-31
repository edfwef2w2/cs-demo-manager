import { GameMode, WeaponName } from 'csdm/common/types/counter-strike';
import { getFilteredMatchIndexRows, getFilteredPlayerMatchIndexRows } from 'csdm/node/store/filter-matches';
import { readMatchEvents } from 'csdm/node/store/match-io';
import { roundNumber } from 'csdm/common/math/round-number';
import type { MatchFilters } from '../match/apply-match-filters';
import type { PlayerBlindTable } from '../player-blinds/player-blind-table';
import type { DamageTable } from '../damages/damage-table';
import type { ShotTable } from '../shots/shot-table';

export type PlayerUtilityStats = {
  steamId: string;
  averageBlindTime: number;
  averageEnemiesFlashed: number;
  averageHeGrenadeDamage: number;
  averageSmokesThrownPerMatch: number;
};

export async function fetchPlayersUtilityStats(
  steamIds: string[],
  filters?: MatchFilters,
): Promise<PlayerUtilityStats[]> {
  const steamIdSet = new Set(steamIds);
  const playerRows = getFilteredPlayerMatchIndexRows(filters).filter((row) => steamIdSet.has(row.steamId));
  const checksums = [...new Set(playerRows.map((row) => row.checksum))];
  const matchByChecksum = new Map(getFilteredMatchIndexRows(filters).map((row) => [row.checksum, row]));

  const blindDurations = new Map<string, number[]>();
  const enemiesFlashedCount = new Map<string, number>();
  const flashbangThrownCount = new Map<string, number>();
  const heDamage = new Map<string, number>();
  const heThrownCount = new Map<string, number>();
  const smokesPerMatch = new Map<string, number[]>();

  for (const steamId of steamIds) {
    blindDurations.set(steamId, []);
    enemiesFlashedCount.set(steamId, 0);
    flashbangThrownCount.set(steamId, 0);
    heDamage.set(steamId, 0);
    heThrownCount.set(steamId, 0);
    smokesPerMatch.set(steamId, []);
  }

  for (const checksum of checksums) {
    const match = matchByChecksum.get(checksum);
    const isScrimmage2v2 = match?.gameModeStr === GameMode.Scrimmage2V2;
    const [blinds, damages, shots] = await Promise.all([
      readMatchEvents<PlayerBlindTable>(checksum, 'blinds'),
      readMatchEvents<DamageTable>(checksum, 'damages'),
      readMatchEvents<ShotTable>(checksum, 'shots'),
    ]);

    const maxDurationKeys = new Set<string>();
    const maxDurationByKey = new Map<string, number>();
    for (const blind of blinds) {
      if (!steamIdSet.has(blind.flasher_steam_id)) {
        continue;
      }
      const key = `${blind.tick}:${blind.flasher_steam_id}`;
      const current = maxDurationByKey.get(key) ?? 0;
      if (blind.duration > current) {
        maxDurationByKey.set(key, blind.duration);
      }
    }

    for (const blind of blinds) {
      if (!steamIdSet.has(blind.flasher_steam_id)) {
        continue;
      }
      if (blind.flasher_side === blind.flashed_side || blind.is_flasher_controlling_bot) {
        continue;
      }
      const key = `${blind.tick}:${blind.flasher_steam_id}`;
      if (maxDurationByKey.get(key) !== blind.duration || maxDurationKeys.has(key)) {
        continue;
      }
      maxDurationKeys.add(key);
      blindDurations.get(blind.flasher_steam_id)?.push(blind.duration);
    }

    for (const blind of blinds) {
      if (!steamIdSet.has(blind.flasher_steam_id)) {
        continue;
      }
      if (
        blind.flasher_side === blind.flashed_side ||
        blind.is_flasher_controlling_bot ||
        blind.duration <= 1 ||
        isScrimmage2v2
      ) {
        continue;
      }
      enemiesFlashedCount.set(blind.flasher_steam_id, (enemiesFlashedCount.get(blind.flasher_steam_id) ?? 0) + 1);
    }

    const smokeCountThisMatch = new Map<string, number>();
    for (const shot of shots) {
      if (!steamIdSet.has(shot.player_steam_id) || shot.is_player_controlling_bot) {
        continue;
      }
      if (shot.weapon_name === WeaponName.Flashbang && !isScrimmage2v2) {
        flashbangThrownCount.set(shot.player_steam_id, (flashbangThrownCount.get(shot.player_steam_id) ?? 0) + 1);
      }
      if (shot.weapon_name === WeaponName.HEGrenade) {
        heThrownCount.set(shot.player_steam_id, (heThrownCount.get(shot.player_steam_id) ?? 0) + 1);
      }
      if (shot.weapon_name === WeaponName.Smoke && !isScrimmage2v2) {
        smokeCountThisMatch.set(shot.player_steam_id, (smokeCountThisMatch.get(shot.player_steam_id) ?? 0) + 1);
      }
    }
    for (const [steamId, count] of smokeCountThisMatch) {
      smokesPerMatch.get(steamId)?.push(count);
    }

    for (const damage of damages) {
      if (!steamIdSet.has(damage.attacker_steam_id)) {
        continue;
      }
      if (
        damage.weapon_name !== WeaponName.HEGrenade ||
        damage.attacker_side === damage.victim_side ||
        damage.is_attacker_controlling_bot
      ) {
        continue;
      }
      heDamage.set(damage.attacker_steam_id, (heDamage.get(damage.attacker_steam_id) ?? 0) + damage.health_damage);
    }
  }

  const average = (values: number[]) => {
    if (values.length === 0) {
      return 0;
    }
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  };

  return steamIds.map((steamId) => {
    const flashbangs = flashbangThrownCount.get(steamId) ?? 0;
    const heThrown = heThrownCount.get(steamId) ?? 0;
    return {
      steamId,
      averageBlindTime: roundNumber(average(blindDurations.get(steamId) ?? []), 1),
      averageEnemiesFlashed: roundNumber((enemiesFlashedCount.get(steamId) ?? 0) / Math.max(flashbangs, 1), 1),
      averageHeGrenadeDamage: roundNumber((heDamage.get(steamId) ?? 0) / Math.max(heThrown, 1), 1),
      averageSmokesThrownPerMatch: roundNumber(average(smokesPerMatch.get(steamId) ?? []), 1),
    };
  });
}
