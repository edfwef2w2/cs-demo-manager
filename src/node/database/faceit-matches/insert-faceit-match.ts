import type { FaceitMatch } from 'csdm/common/types/faceit-match';
import { assignSequentialIds } from 'csdm/node/store/next-id';
import { updateCatalog } from 'csdm/node/store/store';
import type { FaceitMatchPlayerRow } from './faceit-match-player-table';
import type { FaceitMatchRow } from './faceit-match-table';
import type { FaceitMatchTeamRow } from './faceit-match-team-table';

function matchToRow(match: FaceitMatch): FaceitMatchRow {
  return {
    id: match.id,
    game: match.game,
    date: new Date(match.date),
    duration_in_seconds: match.durationInSeconds,
    demo_url: match.demoUrl,
    map_name: match.mapName,
    url: match.url,
    game_mode: match.gameMode,
    winner_id: match.winnerId,
    winner_name: match.winnerName,
  };
}

function buildTeamRows(match: FaceitMatch): FaceitMatchTeamRow[] {
  return assignSequentialIds(
    match.teams.map((team) => {
      return {
        faceit_id: team.id,
        name: team.name,
        score: team.score,
        first_half_score: team.firstHalfScore,
        second_half_score: team.secondHalfScore,
        overtime_score: team.overtimeScore,
        faceit_match_id: match.id,
      };
    }),
  );
}

function buildPlayerRows(match: FaceitMatch): FaceitMatchPlayerRow[] {
  return assignSequentialIds(
    match.players.map((player) => {
      return {
        faceit_id: player.id,
        name: player.name,
        avatar_url: player.avatarUrl,
        team_id: player.teamId,
        team_name: player.teamName,
        kill_count: player.killCount,
        assist_count: player.assistCount,
        death_count: player.deathCount,
        kill_death_ratio: player.killDeathRatio,
        kill_per_round: player.killPerRound,
        headshot_count: player.headshotCount,
        headshot_percentage: player.headshotPercentage,
        mvp_count: player.mvpCount,
        five_kill_count: player.fiveKillCount,
        four_kill_count: player.fourKillCount,
        three_kill_count: player.threeKillCount,
        faceit_match_id: match.id,
      };
    }),
  );
}

export async function insertFaceitMatch(match: FaceitMatch) {
  await updateCatalog('faceitMatches', (current) => {
    if (current.some((document) => document.match.id === match.id)) {
      return current;
    }

    return [
      ...current,
      {
        match: matchToRow(match),
        players: buildPlayerRows(match),
        teams: buildTeamRows(match),
      },
    ];
  });
}
