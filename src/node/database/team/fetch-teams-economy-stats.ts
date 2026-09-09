import { EconomyType, TeamLetter, TeamNumber } from 'csdm/common/types/counter-strike';
import type { TeamEconomyStats } from 'csdm/common/types/team-economy-stats';
import { getFilteredTeamMatchIndexRows } from 'csdm/node/store/filter-matches';
import { readMatchDocument } from 'csdm/node/store/match-io';
import type { MatchFilters } from '../match/apply-match-filters';

type Filters = {
  matchChecksum?: string;
  teamName?: string;
};

type Acc = TeamEconomyStats;

function emptyStats(teamName: string): Acc {
  return {
    teamName,
    pistolCount: 0,
    pistolWonCount: 0,
    pistolLostCount: 0,
    pistolWonAsCtCount: 0,
    pistolLostAsCtCount: 0,
    pistolWonAsTCount: 0,
    pistolLostAsTCount: 0,
    ecoCount: 0,
    ecoWonCount: 0,
    ecoLostCount: 0,
    ecoWonAsCtCount: 0,
    ecoLostAsCtCount: 0,
    ecoWonAsTCount: 0,
    ecoLostAsTCount: 0,
    semiCount: 0,
    semiWonCount: 0,
    semiLostCount: 0,
    semiWonAsCtCount: 0,
    semiLostAsCtCount: 0,
    semiWonAsTCount: 0,
    semiLostAsTCount: 0,
    forceBuyCount: 0,
    forceBuyWonCount: 0,
    forceBuyLostCount: 0,
    forceBuyWonAsCtCount: 0,
    forceBuyLostAsCtCount: 0,
    forceBuyWonAsTCount: 0,
    forceBuyLostAsTCount: 0,
    fullCount: 0,
    fullWonCount: 0,
    fullLostCount: 0,
    fullWonAsCtCount: 0,
    fullLostAsCtCount: 0,
    fullWonAsTCount: 0,
    fullLostAsTCount: 0,
  };
}

function incrementEconomy(stats: Acc, economyType: EconomyType, won: boolean, side: TeamNumber) {
  const prefix = (
    {
      [EconomyType.Pistol]: 'pistol',
      [EconomyType.Eco]: 'eco',
      [EconomyType.Semi]: 'semi',
      [EconomyType.ForceBuy]: 'forceBuy',
      [EconomyType.Full]: 'full',
    } as const
  )[economyType];

  if (!prefix) {
    return;
  }

  const countKey = `${prefix}Count` as keyof Acc;
  const wonKey = `${prefix}WonCount` as keyof Acc;
  const lostKey = `${prefix}LostCount` as keyof Acc;
  const wonCtKey = `${prefix}WonAsCtCount` as keyof Acc;
  const lostCtKey = `${prefix}LostAsCtCount` as keyof Acc;
  const wonTKey = `${prefix}WonAsTCount` as keyof Acc;
  const lostTKey = `${prefix}LostAsTCount` as keyof Acc;

  (stats[countKey] as number) += 1;
  if (won) {
    (stats[wonKey] as number) += 1;
    if (side === TeamNumber.CT) {
      (stats[wonCtKey] as number) += 1;
    } else if (side === TeamNumber.T) {
      (stats[wonTKey] as number) += 1;
    }
  } else {
    (stats[lostKey] as number) += 1;
    if (side === TeamNumber.CT) {
      (stats[lostCtKey] as number) += 1;
    } else if (side === TeamNumber.T) {
      (stats[lostTKey] as number) += 1;
    }
  }
}

export async function fetchTeamsEconomyStats(
  { matchChecksum, teamName }: Filters,
  filters?: MatchFilters,
): Promise<TeamEconomyStats[]> {
  let teamRows = getFilteredTeamMatchIndexRows(filters, teamName);
  if (matchChecksum) {
    teamRows = teamRows.filter((row) => row.checksum === matchChecksum);
  }

  const statsByTeam = new Map<string, Acc>();
  const documents = new Map<string, Awaited<ReturnType<typeof readMatchDocument>>>();

  for (const team of teamRows) {
    if (!documents.has(team.checksum)) {
      documents.set(team.checksum, await readMatchDocument(team.checksum));
    }
    const document = documents.get(team.checksum);
    if (!document) {
      continue;
    }

    const stats = statsByTeam.get(team.name) ?? emptyStats(team.name);
    for (const round of document.rounds) {
      const economyType =
        team.letter === TeamLetter.A
          ? round.team_a_economy_type
          : team.letter === TeamLetter.B
            ? round.team_b_economy_type
            : undefined;
      const side =
        team.letter === TeamLetter.A
          ? round.team_a_side
          : team.letter === TeamLetter.B
            ? round.team_b_side
            : undefined;
      if (economyType === undefined || side === undefined) {
        continue;
      }
      incrementEconomy(stats, economyType, round.winner_name === team.name, side);
    }
    statsByTeam.set(team.name, stats);
  }

  return Array.from(statsByTeam.values());
}
