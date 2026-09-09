import { getFilteredPlayerMatchIndexRows } from 'csdm/node/store/filter-matches';
import { readMatchEvents } from 'csdm/node/store/match-io';
import { roundNumber } from 'csdm/common/math/round-number';
import type { MatchFilters } from '../match/apply-match-filters';
import { TeamNumber, WeaponName } from 'csdm/common/types/counter-strike';
import type { KillRow } from '../kills/kill-table';

export type PlayerOpeningDuelsStats = {
  successPercentage: number;
  tradePercentage: number;
  bestWeapon: WeaponName;
};

type PlayerOpeningDuelsStatsPerSide = Record<'ct' | 't' | 'all', PlayerOpeningDuelsStats>;

type OpeningDuel = {
  weaponName: WeaponName;
  isSuccess: boolean;
  isTraded: boolean;
  playerSide: TeamNumber;
};

function computeStats(duels: OpeningDuel[]): PlayerOpeningDuelsStats {
  if (duels.length === 0) {
    return {
      successPercentage: 0,
      tradePercentage: 0,
      bestWeapon: WeaponName.Unknown,
    };
  }

  const successCount = duels.filter((duel) => duel.isSuccess).length;
  const tradeCount = duels.filter((duel) => duel.isTraded).length;
  const weaponCounts = new Map<WeaponName, number>();
  for (const duel of duels) {
    if (!duel.isSuccess) {
      continue;
    }
    weaponCounts.set(duel.weaponName, (weaponCounts.get(duel.weaponName) ?? 0) + 1);
  }

  let bestWeapon: WeaponName = WeaponName.Unknown;
  let bestWeaponCount = 0;
  for (const [weapon, count] of weaponCounts) {
    if (count > bestWeaponCount) {
      bestWeapon = weapon;
      bestWeaponCount = count;
    }
  }

  return {
    successPercentage: roundNumber((successCount / duels.length) * 100),
    tradePercentage: roundNumber((tradeCount / duels.length) * 100),
    bestWeapon,
  };
}

export async function fetchPlayerOpeningDuelsStats(
  steamId: string,
  filters?: MatchFilters,
): Promise<PlayerOpeningDuelsStatsPerSide> {
  const checksums = getFilteredPlayerMatchIndexRows(filters, steamId).map((row) => row.checksum);
  const openingDuels: OpeningDuel[] = [];

  for (const checksum of checksums) {
    const kills = await readMatchEvents<KillRow>(checksum, 'kills');
    const firstTickPerRound = new Map<number, number>();
    for (const kill of kills) {
      const current = firstTickPerRound.get(kill.round_number);
      if (current === undefined || kill.tick < current) {
        firstTickPerRound.set(kill.round_number, kill.tick);
      }
    }

    for (const kill of kills) {
      if (firstTickPerRound.get(kill.round_number) !== kill.tick) {
        continue;
      }
      if (kill.killer_steam_id !== steamId && kill.victim_steam_id !== steamId) {
        continue;
      }

      const isSuccess = kill.killer_steam_id === steamId;
      openingDuels.push({
        weaponName: kill.weapon_name,
        isSuccess,
        isTraded: kill.is_trade_death,
        playerSide: isSuccess ? kill.killer_side : kill.victim_side,
      });
    }
  }

  return {
    ct: computeStats(openingDuels.filter((duel) => duel.playerSide === TeamNumber.CT)),
    t: computeStats(openingDuels.filter((duel) => duel.playerSide === TeamNumber.T)),
    all: computeStats(openingDuels),
  };
}
