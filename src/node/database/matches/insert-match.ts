import fs from 'fs-extra';
import path from 'node:path';
import { TeamLetter } from 'csdm/common/types/counter-strike';
import { roundNumber } from 'csdm/common/math/round-number';
import {
  deleteCsvFilesInOutputFolder,
  getDemoNameFromPath,
  type InsertOptions,
} from './match-insertion';
import { deleteMatchesByChecksums } from './delete-matches-by-checksums';
import { insertMatchPositions } from './insert-match-positions';
import { InsertRoundsError } from './errors/insert-rounds-error';
import {
  parseBlindsCsv,
  parseBombsCsv,
  parseBuysCsv,
  parseChatMessagesCsv,
  parseChickenDeathsCsv,
  parseClutchesCsv,
  parseDamagesCsv,
  parseDecoysCsv,
  parseDemoCsv,
  parseEconomiesCsv,
  parseFlashbangsCsv,
  parseGrenadeBouncesCsv,
  parseGrenadeProjectilesDestroyCsv,
  parseHeGrenadesCsv,
  parseHostagesCsv,
  parseKillsCsv,
  parseMatchCsv,
  parsePlayersCsv,
  parseRoundsCsv,
  parseShotsCsv,
  parseSmokesCsv,
  parseTeamsCsv,
} from './insert-match-from-csvs';
import { writeJsonAtomic } from 'csdm/node/store/atomic-write';
import { computeCollateralKillCount } from 'csdm/node/store/compute-collateral-kills';
import type { MatchIndexRow, PlayerMatchIndexRow, TeamMatchIndexRow } from 'csdm/node/store/index-types';
import { writeMatchDocument, writeMatchEvents } from 'csdm/node/store/match-io';
import { getDemoFilePath, getMatchFolderPath, getMatchTempFolderPath } from 'csdm/node/store/paths';
import { getStore, replaceMatchIndexRows } from 'csdm/node/store/store';
import type { MatchDocument } from 'csdm/node/store/match-document';
import type { KillRow } from '../kills/kill-table';
import type { MatchPlayerTable } from '../match-players/match-player-table';
import type { TeamRow } from '../teams/team-table';
import type { DemoRow } from '../demos/demo-table';
import type { MatchRow } from './match-table';

function buildMatchIndexRow(parameters: {
  match: MatchRow;
  demo: DemoRow;
  teams: TeamRow[];
  players: MatchPlayerTable[];
  kills: KillRow[];
}): MatchIndexRow {
  const teamA = parameters.teams.find((team) => team.letter === TeamLetter.A);
  const teamB = parameters.teams.find((team) => team.letter === TeamLetter.B);
  const fiveKillCount = parameters.players.reduce((sum, player) => sum + player.five_kill_count, 0);
  const fourKillCount = parameters.players.reduce((sum, player) => sum + player.four_kill_count, 0);
  const threeKillCount = parameters.players.reduce((sum, player) => sum + player.three_kill_count, 0);
  const hltvRating2 =
    parameters.players.length === 0
      ? 0
      : roundNumber(
          parameters.players.reduce((sum, player) => sum + player.hltv_rating_2, 0) / parameters.players.length,
          2,
        );

  return {
    checksum: parameters.match.checksum,
    demoPath: parameters.match.demo_path,
    name: parameters.demo.name,
    game: parameters.demo.game,
    source: parameters.demo.source,
    type: parameters.demo.type,
    date: parameters.demo.date.toISOString(),
    mapName: parameters.demo.map_name,
    tickCount: parameters.demo.tick_count,
    tickrate: parameters.demo.tickrate,
    framerate: parameters.demo.framerate,
    duration: parameters.demo.duration,
    serverName: parameters.demo.server_name,
    clientName: parameters.demo.client_name,
    networkProtocol: parameters.demo.network_protocol,
    buildNumber: parameters.demo.build_number,
    shareCode: parameters.demo.share_code,
    gameType: parameters.match.game_type,
    gameMode: parameters.match.game_mode,
    gameModeStr: parameters.match.game_mode_str,
    isRanked: parameters.match.is_ranked,
    killCount: parameters.match.kill_count,
    deathCount: parameters.match.death_count,
    assistCount: parameters.match.assist_count,
    shotCount: parameters.match.shot_count,
    analyzeDate: parameters.match.analyze_date.toISOString(),
    winnerName: parameters.match.winner_name,
    winnerSide: parameters.match.winner_side,
    overtimeCount: parameters.match.overtime_count,
    maxRounds: parameters.match.max_rounds,
    hasVacLiveBan: parameters.match.has_vac_live_ban,
    teamAName: teamA?.name ?? '',
    teamAScore: teamA?.score ?? 0,
    teamBName: teamB?.name ?? '',
    teamBScore: teamB?.score ?? 0,
    fiveKillCount,
    fourKillCount,
    threeKillCount,
    hltvRating2,
    collateralKillCount: computeCollateralKillCount(parameters.kills),
    playerSteamIds: parameters.players.map((player) => player.steam_id),
    teamNames: parameters.teams.map((team) => team.name),
  };
}

function buildPlayerMatchIndexRows(parameters: {
  match: MatchRow;
  demo: DemoRow;
  players: MatchPlayerTable[];
  kills: KillRow[];
}): PlayerMatchIndexRow[] {
  return parameters.players.map((player) => {
    let wallbangKillCount = 0;
    let deathWhileInspectingWeaponCount = 0;
    for (const kill of parameters.kills) {
      if (kill.killer_steam_id === player.steam_id && kill.penetrated_objects > 0) {
        wallbangKillCount += 1;
      }
      if (kill.victim_steam_id === player.steam_id && kill.is_victim_inspecting_weapon) {
        deathWhileInspectingWeaponCount += 1;
      }
    }

    return {
      checksum: parameters.match.checksum,
      steamId: player.steam_id,
      name: player.name,
      teamName: player.team_name,
      date: parameters.demo.date.toISOString(),
      mapName: parameters.demo.map_name,
      source: parameters.demo.source,
      type: parameters.demo.type,
      game: parameters.demo.game,
      gameModeStr: parameters.match.game_mode_str,
      isRanked: parameters.match.is_ranked,
      maxRounds: parameters.match.max_rounds,
      rank: player.rank,
      rankType: player.rank_type,
      oldRank: player.old_rank,
      winsCount: player.wins_count,
      killCount: player.kill_count,
      deathCount: player.death_count,
      assistCount: player.assist_count,
      headshotCount: player.headshot_count,
      headshotPercentage: player.headshot_percentage,
      mvpCount: player.mvp_count,
      utilityDamage: player.utility_damage,
      averageDamagePerRound: player.average_damage_per_round,
      utilityDamagePerRound: player.utility_damage_per_round,
      kast: player.kast,
      hltvRating: player.hltv_rating,
      hltvRating2: player.hltv_rating_2,
      averageKillPerRound: player.average_kill_per_round,
      averageDeathPerRound: player.average_death_per_round,
      oneKillCount: player.one_kill_count,
      twoKillCount: player.two_kill_count,
      threeKillCount: player.three_kill_count,
      fourKillCount: player.four_kill_count,
      fiveKillCount: player.five_kill_count,
      bombPlantedCount: player.bomb_planted_count,
      bombDefusedCount: player.bomb_defused_count,
      firstKillCount: player.first_kill_count,
      firstDeathCount: player.first_death_count,
      firstTradeKillCount: player.first_trade_kill_count,
      firstTradeDeathCount: player.first_trade_death_count,
      tradeKillCount: player.trade_kill_count,
      tradeDeathCount: player.trade_death_count,
      damageHealth: player.damage_health,
      damageArmor: player.damage_armor,
      hostageRescuedCount: player.hostage_rescued_count,
      inspectWeaponCount: player.inspect_weapon_count,
      score: player.score,
      color: player.color,
      index: player.index,
      crosshairShareCode: player.crosshair_share_code,
      wallbangKillCount,
      deathWhileInspectingWeaponCount,
    };
  });
}

function buildTeamMatchIndexRows(parameters: {
  match: MatchRow;
  demo: DemoRow;
  teams: TeamRow[];
  players: MatchPlayerTable[];
}): TeamMatchIndexRow[] {
  return parameters.teams.map((team) => {
    const players = parameters.players.filter((player) => player.team_name === team.name);
    const killCount = players.reduce((sum, player) => sum + player.kill_count, 0);
    const deathCount = players.reduce((sum, player) => sum + player.death_count, 0);
    const playerCount = players.length || 1;

    return {
      checksum: parameters.match.checksum,
      name: team.name,
      letter: String(team.letter),
      score: team.score,
      currentSide: team.current_side,
      date: parameters.demo.date.toISOString(),
      mapName: parameters.demo.map_name,
      source: parameters.demo.source,
      type: parameters.demo.type,
      game: parameters.demo.game,
      gameModeStr: parameters.match.game_mode_str,
      isRanked: parameters.match.is_ranked,
      maxRounds: parameters.match.max_rounds,
      winnerName: parameters.match.winner_name,
      killCount,
      deathCount,
      assistCount: players.reduce((sum, player) => sum + player.assist_count, 0),
      headshotCount: players.reduce((sum, player) => sum + player.headshot_count, 0),
      headshotPercentage: players.reduce((sum, player) => sum + player.headshot_percentage, 0) / playerCount,
      threeKillCount: players.reduce((sum, player) => sum + player.three_kill_count, 0),
      fourKillCount: players.reduce((sum, player) => sum + player.four_kill_count, 0),
      fiveKillCount: players.reduce((sum, player) => sum + player.five_kill_count, 0),
      kast: players.reduce((sum, player) => sum + player.kast, 0) / playerCount,
      hltvRating: players.reduce((sum, player) => sum + player.hltv_rating, 0) / playerCount,
      hltvRating2: players.reduce((sum, player) => sum + player.hltv_rating_2, 0) / playerCount,
      averageDamagePerRound: players.reduce((sum, player) => sum + player.average_damage_per_round, 0) / playerCount,
    };
  });
}

export type InsertMatchParameters = {
  checksum: string;
  demoPath: string;
  outputFolderPath: string;
};

export async function insertMatch({ checksum, demoPath, outputFolderPath }: InsertMatchParameters) {
  const store = getStore();
  const demoName = getDemoNameFromPath(demoPath);
  const options: InsertOptions = { outputFolderPath, demoName };
  const tempFolderPath = getMatchTempFolderPath(store.rootPath, checksum);
  const finalFolderPath = getMatchFolderPath(store.rootPath, checksum);

  try {
    await deleteMatchesByChecksums([checksum]);
    await fs.remove(tempFolderPath);
    await fs.ensureDir(tempFolderPath);

    const [demo, match] = await Promise.all([parseDemoCsv(options), parseMatchCsv(options, demoPath)]);

    let rounds;
    try {
      rounds = await parseRoundsCsv(options);
    } catch (error) {
      throw new InsertRoundsError(error);
    }

    const [
      teams,
      players,
      kills,
      shots,
      damages,
      clutches,
      blinds,
      economies,
      buys,
      chatMessages,
      grenadeBounces,
      grenadeProjectilesDestroy,
      heGrenades,
      smokes,
      decoys,
      flashbangs,
      bombs,
      hostages,
      chickenDeaths,
    ] = await Promise.all([
      parseTeamsCsv(options),
      parsePlayersCsv(options),
      parseKillsCsv(options),
      parseShotsCsv(options),
      parseDamagesCsv(options),
      parseClutchesCsv(options),
      parseBlindsCsv(options),
      parseEconomiesCsv(options),
      parseBuysCsv(options),
      parseChatMessagesCsv(options),
      parseGrenadeBouncesCsv(options),
      parseGrenadeProjectilesDestroyCsv(options),
      parseHeGrenadesCsv(options),
      parseSmokesCsv(options),
      parseDecoysCsv(options),
      parseFlashbangsCsv(options),
      parseBombsCsv(options),
      parseHostagesCsv(options),
      parseChickenDeathsCsv(options),
    ]);

    const document: MatchDocument = {
      match,
      demo,
      teams,
      players,
      rounds,
    };

    await Promise.all([
      writeMatchDocument(tempFolderPath, document),
      writeMatchEvents(tempFolderPath, 'kills', kills),
      writeMatchEvents(tempFolderPath, 'shots', shots),
      writeMatchEvents(tempFolderPath, 'damages', damages),
      writeMatchEvents(tempFolderPath, 'clutches', clutches),
      writeMatchEvents(tempFolderPath, 'blinds', blinds),
      writeMatchEvents(tempFolderPath, 'economies', economies),
      writeMatchEvents(tempFolderPath, 'buys', buys),
      writeMatchEvents(tempFolderPath, 'chatMessages', chatMessages),
      writeMatchEvents(tempFolderPath, 'grenadeBounces', grenadeBounces),
      writeMatchEvents(tempFolderPath, 'grenadeProjectilesDestroy', grenadeProjectilesDestroy),
      writeMatchEvents(tempFolderPath, 'heGrenadesExplode', heGrenades),
      writeMatchEvents(tempFolderPath, 'smokesStart', smokes),
      writeMatchEvents(tempFolderPath, 'decoysStart', decoys),
      writeMatchEvents(tempFolderPath, 'flashbangsExplode', flashbangs),
      writeMatchEvents(tempFolderPath, 'bombs', bombs),
      writeMatchEvents(tempFolderPath, 'hostages', hostages),
      writeMatchEvents(tempFolderPath, 'chickenDeaths', chickenDeaths),
      insertMatchPositions({
        demoName,
        outputFolderPath,
        destinationFolderPath: path.join(tempFolderPath, 'positions'),
      }),
    ]);

    await fs.move(tempFolderPath, finalFolderPath, { overwrite: true });
    await writeJsonAtomic(getDemoFilePath(store.rootPath, checksum), demo);

    await replaceMatchIndexRows({
      checksum,
      match: buildMatchIndexRow({ match, demo, teams, players, kills }),
      players: buildPlayerMatchIndexRows({ match, demo, players, kills }),
      teams: buildTeamMatchIndexRows({ match, demo, teams, players }),
    });
  } catch (error) {
    await fs.remove(tempFolderPath);
    await deleteMatchesByChecksums([checksum]);
    throw error;
  } finally {
    await deleteCsvFilesInOutputFolder(outputFolderPath);
  }
}
