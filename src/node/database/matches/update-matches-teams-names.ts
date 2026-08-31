import { TeamLetter } from 'csdm/common/types/counter-strike';
import { isBlankString } from 'csdm/common/string/is-empty-string';
import { DuplicateTeamNameError } from 'csdm/node/database/teams/errors/duplicate-team-name-error';
import {
  fetchTeamNamesPerChecksum,
  type TeamNamesPerChecksum,
} from 'csdm/node/database/matches/fetch-team-names-per-checksum';
import { TeamsNotFound } from 'csdm/node/database/teams/errors/teams-not-found';
import { getStore, saveIndexes } from 'csdm/node/store/store';
import {
  getOpenedMatchFolderPath,
  getMatchPositionFilePath,
  readMatchDocument,
  readMatchEvents,
  writeMatchDocument,
  writeMatchEvents,
} from 'csdm/node/store/match-io';
import type { MatchEventName } from 'csdm/node/store/match-document';
import { csvColumns, parseCsvFile } from 'csdm/node/store/parse-csv';
import fs from 'fs-extra';
import type { GrenadePositionTable } from '../grenade-position/grenade-position-table';

type UpdateTeamNameArgs = {
  checksum: string;
  oldName: string;
  newName: string;
  opponentTeamName: string;
  letter: TeamLetter;
};

function replaceTeamName(rows: Array<Record<string, unknown>>, fields: string[], oldName: string, newName: string) {
  for (const row of rows) {
    for (const field of fields) {
      if (row[field] === oldName) {
        row[field] = newName;
      }
    }
  }
}

async function updateEventTeamNames(
  checksum: string,
  eventName: MatchEventName,
  fields: string[],
  oldName: string,
  newName: string,
) {
  const rows = await readMatchEvents<Record<string, unknown>>(checksum, eventName);
  if (rows.length === 0) {
    return;
  }
  replaceTeamName(rows, fields, oldName, newName);
  await writeMatchEvents(getOpenedMatchFolderPath(checksum), eventName, rows);
}

async function updateGrenadePositionsTeamName(checksum: string, oldName: string, newName: string) {
  const filePath = getMatchPositionFilePath(checksum, 'grenades');
  if (!(await fs.pathExists(filePath))) {
    return;
  }

  const columns = csvColumns([
    ['frame', 'number'],
    ['tick', 'number'],
    ['round_number', 'number'],
    ['grenade_id', 'string'],
    ['projectile_id', 'string'],
    ['grenade_name', 'string'],
    ['x', 'number'],
    ['y', 'number'],
    ['z', 'number'],
    ['thrower_steam_id', 'string'],
    ['thrower_name', 'string'],
    ['thrower_side', 'number'],
    ['thrower_team_name', 'string'],
    ['thrower_velocity_x', 'number'],
    ['thrower_velocity_y', 'number'],
    ['thrower_velocity_z', 'number'],
    ['thrower_yaw', 'number'],
    ['thrower_pitch', 'number'],
    ['match_checksum', 'string'],
  ]);
  const rows = await parseCsvFile<GrenadePositionTable>(filePath, columns as never);
  let changed = false;
  for (const row of rows) {
    if (row.thrower_team_name === oldName) {
      row.thrower_team_name = newName;
      changed = true;
    }
  }
  if (!changed) {
    return;
  }

  const lines = rows.map((row) =>
    [
      row.frame,
      row.tick,
      row.round_number,
      row.grenade_id,
      row.projectile_id,
      row.grenade_name,
      row.x,
      row.y,
      row.z,
      row.thrower_steam_id,
      row.thrower_name,
      row.thrower_side,
      row.thrower_team_name,
      row.thrower_velocity_x,
      row.thrower_velocity_y,
      row.thrower_velocity_z,
      row.thrower_yaw,
      row.thrower_pitch,
      row.match_checksum,
    ].join(','),
  );
  await fs.writeFile(filePath, `${lines.join('\n')}${lines.length > 0 ? '\n' : ''}`, 'utf8');
}

async function updateTeamName({ oldName, checksum, newName, letter, opponentTeamName }: UpdateTeamNameArgs) {
  if (isBlankString(newName) || newName === oldName) {
    return oldName;
  }

  if (newName === opponentTeamName) {
    throw new DuplicateTeamNameError(newName);
  }

  const document = await readMatchDocument(checksum);
  if (!document) {
    throw new TeamsNotFound();
  }

  for (const team of document.teams) {
    if (team.letter === letter && team.name === oldName) {
      team.name = newName;
    }
  }
  if (document.match.winner_name === oldName) {
    document.match.winner_name = newName;
  }
  for (const player of document.players) {
    if (player.team_name === oldName) {
      player.team_name = newName;
    }
  }
  for (const round of document.rounds) {
    if (letter === TeamLetter.A && round.team_a_name === oldName) {
      round.team_a_name = newName;
    }
    if (letter === TeamLetter.B && round.team_b_name === oldName) {
      round.team_b_name = newName;
    }
    if (round.winner_name === oldName) {
      round.winner_name = newName;
    }
  }
  await writeMatchDocument(getOpenedMatchFolderPath(checksum), document);

  await Promise.all([
    updateEventTeamNames(
      checksum,
      'kills',
      ['killer_team_name', 'victim_team_name', 'assister_team_name'],
      oldName,
      newName,
    ),
    updateEventTeamNames(checksum, 'damages', ['attacker_team_name', 'victim_team_name'], oldName, newName),
    updateEventTeamNames(checksum, 'decoysStart', ['thrower_team_name'], oldName, newName),
    updateEventTeamNames(checksum, 'flashbangsExplode', ['thrower_team_name'], oldName, newName),
    updateEventTeamNames(checksum, 'grenadeBounces', ['thrower_team_name'], oldName, newName),
    updateEventTeamNames(checksum, 'grenadeProjectilesDestroy', ['thrower_team_name'], oldName, newName),
    updateEventTeamNames(checksum, 'heGrenadesExplode', ['thrower_team_name'], oldName, newName),
    updateEventTeamNames(checksum, 'shots', ['player_team_name'], oldName, newName),
    updateEventTeamNames(checksum, 'smokesStart', ['thrower_team_name'], oldName, newName),
    updateGrenadePositionsTeamName(checksum, oldName, newName),
  ]);

  const { matchIndex, playerMatchIndex, teamMatchIndex } = getStore();
  for (const row of matchIndex) {
    if (row.checksum !== checksum) {
      continue;
    }
    if (letter === TeamLetter.A && row.teamAName === oldName) {
      row.teamAName = newName;
    }
    if (letter === TeamLetter.B && row.teamBName === oldName) {
      row.teamBName = newName;
    }
    if (row.winnerName === oldName) {
      row.winnerName = newName;
    }
    row.teamNames = row.teamNames.map((name) => (name === oldName ? newName : name));
  }
  for (const row of playerMatchIndex) {
    if (row.checksum === checksum && row.teamName === oldName) {
      row.teamName = newName;
    }
  }
  for (const row of teamMatchIndex) {
    if (row.checksum !== checksum) {
      continue;
    }
    if (row.name === oldName) {
      row.name = newName;
    }
    if (row.winnerName === oldName) {
      row.winnerName = newName;
    }
  }

  return newName;
}

type UpdateMatchesTeamNamesArgs = {
  checksums: string[];
  teamNameA: string;
  teamNameB: string;
  onProgress: (updatedCount: number) => void;
  signal: AbortSignal;
};

export async function updateMatchesTeamNames({
  checksums,
  teamNameA,
  teamNameB,
  onProgress,
  signal,
}: UpdateMatchesTeamNamesArgs) {
  if (teamNameA === teamNameB) {
    throw new DuplicateTeamNameError(teamNameA);
  }

  const teamNamesPerChecksum = await fetchTeamNamesPerChecksum(checksums);
  const updates: TeamNamesPerChecksum = {};

  for (const [index, checksum] of checksums.entries()) {
    const names = teamNamesPerChecksum[checksum];
    if (!names) {
      throw new TeamsNotFound();
    }

    const newTeamNameA = await updateTeamName({
      checksum,
      oldName: names.teamNameA,
      newName: teamNameA,
      letter: TeamLetter.A,
      opponentTeamName: isBlankString(teamNameB) ? names.teamNameB : teamNameB,
    });
    const newTeamNameB = await updateTeamName({
      checksum,
      oldName: names.teamNameB,
      newName: teamNameB,
      letter: TeamLetter.B,
      opponentTeamName: isBlankString(teamNameA) ? names.teamNameA : teamNameA,
    });

    if (newTeamNameA !== names.teamNameA || newTeamNameB !== names.teamNameB) {
      updates[checksum] = {
        teamNameA: newTeamNameA,
        teamNameB: newTeamNameB,
      };
    }

    onProgress(index + 1);

    if (signal.aborted) {
      break;
    }
  }

  if (Object.keys(updates).length > 0) {
    await saveIndexes();
  }

  return updates;
}
