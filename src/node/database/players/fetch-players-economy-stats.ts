import { EconomyType } from 'csdm/common/types/counter-strike';
import { getFilteredPlayerMatchIndexRows } from 'csdm/node/store/filter-matches';
import { readMatchEvents } from 'csdm/node/store/match-io';
import { roundNumber } from 'csdm/common/math/round-number';
import type { MatchFilters } from '../match/apply-match-filters';
import type { PlayerEconomyTable } from '../player-economies/player-economy-table';

export type PlayerEconomyStats = {
  steamId: string;
  averageMoneySpentPerRound: number;
  ecoCount: number;
  semiEcoCount: number;
  forceBuyCount: number;
  fullBuyCount: number;
};

export async function fetchPlayersEconomyStats(
  steamIds: string[],
  filters?: MatchFilters,
): Promise<PlayerEconomyStats[]> {
  const steamIdSet = new Set(steamIds);
  const playerRows = getFilteredPlayerMatchIndexRows(filters).filter((row) => steamIdSet.has(row.steamId));
  const checksums = [...new Set(playerRows.map((row) => row.checksum))];

  const stats = new Map<
    string,
    {
      moneySpentSum: number;
      roundCount: number;
      ecoCount: number;
      semiEcoCount: number;
      forceBuyCount: number;
      fullBuyCount: number;
    }
  >();

  for (const steamId of steamIds) {
    stats.set(steamId, {
      moneySpentSum: 0,
      roundCount: 0,
      ecoCount: 0,
      semiEcoCount: 0,
      forceBuyCount: 0,
      fullBuyCount: 0,
    });
  }

  for (const checksum of checksums) {
    const economies = await readMatchEvents<PlayerEconomyTable>(checksum, 'economies');
    for (const economy of economies) {
      if (!steamIdSet.has(economy.player_steam_id)) {
        continue;
      }
      const current = stats.get(economy.player_steam_id);
      if (!current) {
        continue;
      }
      current.moneySpentSum += economy.money_spent;
      current.roundCount += 1;
      switch (economy.type) {
        case EconomyType.Eco:
          current.ecoCount += 1;
          break;
        case EconomyType.Semi:
          current.semiEcoCount += 1;
          break;
        case EconomyType.ForceBuy:
          current.forceBuyCount += 1;
          break;
        case EconomyType.Full:
          current.fullBuyCount += 1;
          break;
      }
    }
  }

  return steamIds.toSorted().map((steamId) => {
      const current = stats.get(steamId)!;
      return {
        steamId,
        averageMoneySpentPerRound: roundNumber(current.moneySpentSum / Math.max(current.roundCount, 1), 2),
        ecoCount: current.ecoCount,
        semiEcoCount: current.semiEcoCount,
        forceBuyCount: current.forceBuyCount,
        fullBuyCount: current.fullBuyCount,
      };
    });
}
