import type { Match } from 'csdm/common/types/match';
import { matchRowToMatch } from './match-row-to-match';
import { fetchMatchPlayers } from '../match-players/fetch-match-players';
import { fetchRounds } from '../rounds/fetch-rounds';
import { fetchKills } from '../kills/fetch-kills';
import { fetchClutches } from '../clutches/fetch-cluches';
import { fetchMatchTeamA } from './fetch-match-team-a';
import { fetchMatchTeamB } from './fetch-match-team-b';
import { fetchDamages } from '../damages/fetch-damages';
import { fetchPlayerBlinds } from '../player-blinds/fetch-player-blinds';
import { fetchShots } from '../shots/fetch-shots';
import { fetchChatMessages } from 'csdm/node/database/chat-messages/fetch-chat-messages';
import { fetchChickenDeaths } from '../chicken-death/fetch-chicken-deaths';
import { fetchBombsPlanted } from '../bomb-planted/fetch-bombs-planted';
import { fetchBombsDefused } from '../bomb-defused/fetch-bombs-defused';
import { fetchBombsExploded } from '../bomb-exploded/fetch-bombs-exploded';
import { fetchCollateralKillCountPerMatch } from './fetch-collateral-kill-count-per-match';
import { fetchPlayersEconomies } from '../player-economies/fetch-player-economies';
import { fetchMatchTeamsEconomyStats } from '../match/fetch-match-teams-economy-stats';
import { readMatchDocument } from 'csdm/node/store/match-io';
import { getStore } from 'csdm/node/store/store';

export async function fetchMatchesByChecksums(checksums: string[]) {
  const collateralKillCountPerMatch = await fetchCollateralKillCountPerMatch(checksums);
  const { catalogs } = getStore();

  const matches: Match[] = [];
  for (const checksum of checksums) {
    const document = await readMatchDocument(checksum);
    if (!document) {
      continue;
    }

    const comment = catalogs.comments.find((row) => row.checksum === checksum)?.comment ?? null;
    const [teamA, teamB] = await Promise.all([fetchMatchTeamA(checksum), fetchMatchTeamB(checksum)]);
    const match = await matchRowToMatch(
      { ...document.demo, ...document.match },
      teamA,
      teamB,
      collateralKillCountPerMatch,
      comment,
    );
    const [
      players,
      rounds,
      kills,
      clutches,
      bombsPlanted,
      bombsDefused,
      bombsExploded,
      damages,
      blinds,
      playersEconomies,
      shots,
      chatMessages,
      chickenDeaths,
      teamsEconomyStats,
    ] = await Promise.all([
      fetchMatchPlayers(checksum),
      fetchRounds(checksum),
      fetchKills(checksum),
      fetchClutches(checksum),
      fetchBombsPlanted(checksum),
      fetchBombsDefused(checksum),
      fetchBombsExploded(checksum),
      fetchDamages(checksum),
      fetchPlayerBlinds(checksum),
      fetchPlayersEconomies(checksum),
      fetchShots({
        checksum,
      }),
      fetchChatMessages(checksum),
      fetchChickenDeaths(checksum),
      fetchMatchTeamsEconomyStats(checksum),
    ]);

    match.players = players;
    match.rounds = rounds;
    match.kills = kills;
    match.clutches = clutches;
    match.bombsPlanted = bombsPlanted;
    match.bombsDefused = bombsDefused;
    match.bombsExploded = bombsExploded;
    match.damages = damages;
    match.blinds = blinds;
    match.playersEconomies = playersEconomies;
    match.shots = shots;
    match.chatMessages = chatMessages;
    match.chickenDeaths = chickenDeaths;
    match.teamsEconomyStats = teamsEconomyStats;
    matches.push(match);
  }

  return matches;
}
