import type {
  DemoSource,
  DemoType,
  Game,
  GameMode,
  GameType,
  TeamLetter,
  TeamNumber,
} from 'csdm/common/types/counter-strike';
import { roundNumber } from 'csdm/common/math/round-number';
import type { BombDefuseStartTable } from '../bomb-defuse-start/bomb-defuse-start-table';
import type { BombDefusedTable } from '../bomb-defused/bomb-defused-table';
import type { BombExplodedTable } from '../bomb-exploded/bomb-exploded-table';
import type { BombPlantStartTable } from '../bomb-plant-start/bomb-plant-start-table';
import type { BombPlantedTable } from '../bomb-planted/bomb-planted-table';
import type { ChatMessageTable } from '../chat-messages/chat-message-table';
import type { ChickenDeathTable } from '../chicken-death/chicken-death-table';
import type { ClutchTable } from '../clutches/clutch-table';
import type { DamageTable } from '../damages/damage-table';
import type { DecoyStartTable } from '../decoy-started/decoy-start-table';
import type { DemoRow } from '../demos/demo-table';
import type { FlashbangExplodeTable } from '../flashbang-exploded/flashbang-explode-table';
import type { GrenadeBounceTable } from '../grenade-bounce/grenade-bounce-table';
import type { GrenadeProjectileDestroyTable } from '../grenade-projectile-destroy/grenade-projectile-destroy-table';

import type { HeGrenadeExplodeTable } from '../he-grenade-exploded/he-grenade-explode-table';
import type { HostagePickUpStartTable } from '../hostage-pick-up-start/hostage-pick-up-start-table';
import type { HostagePickedUpTable } from '../hostage-picked-up/hostage-picked-up-table';
import type { HostageRescuedTable } from '../hostage-rescued/hostage-rescued-table';
import type { KillTable } from '../kills/kill-table';
import type { MatchPlayerTable } from '../match-players/match-player-table';
import type { MatchRow } from './match-table';
import type { PlayerBlindTable } from '../player-blinds/player-blind-table';
import type { PlayerBuyTable } from '../player-buy/player-buy-table';
import type { PlayerEconomyTable } from '../player-economies/player-economy-table';
import type { RoundTable } from '../rounds/round-table';
import type { ShotTable } from '../shots/shot-table';
import type { SmokeStartTable } from '../smoke-started/smoke-start-table';
import type { TeamRow } from '../teams/team-table';
import { csvColumns, parseCsvFile, parseCsvFirstRow, type CsvValueType } from 'csdm/node/store/parse-csv';
import { assignSequentialIds } from 'csdm/node/store/next-id';
import { getCsvFilePath, type InsertOptions } from './match-insertion';
import { InvalidMatchDate } from './errors/invalid-match-date';

async function parseRows<T extends object>(csvFilePath: string, spec: Array<[string, CsvValueType]>) {
  return parseCsvFile<T>(csvFilePath, csvColumns(spec));
}

function withIds<T extends object>(rows: T[]) {
  return assignSequentialIds(rows);
}

export async function parseDemoCsv({ outputFolderPath, demoName }: InsertOptions): Promise<DemoRow> {
  const csvFilePath = getCsvFilePath(outputFolderPath, demoName, '_demo.csv');
  const row = await parseCsvFirstRow<Record<string, unknown>>(
    csvFilePath,
    csvColumns([
      ['checksum', 'string'],
      ['game', 'string'],
      ['name', 'string'],
      ['date', 'string'],
      ['source', 'string'],
      ['type', 'string'],
      ['share_code', 'nullable-string'],
      ['map_name', 'string'],
      ['server_name', 'string'],
      ['client_name', 'string'],
      ['tick_count', 'number'],
      ['tickrate', 'number'],
      ['framerate', 'number'],
      ['duration', 'number'],
      ['network_protocol', 'number'],
      ['build_number', 'number'],
    ]),
  );

  if (row === undefined) {
    throw new Error(`Demo CSV is empty: ${csvFilePath}`);
  }

  const date = new Date(String(row.date));
  if (Number.isNaN(date.getTime())) {
    throw new InvalidMatchDate(`Invalid match date: ${String(row.date)}`);
  }

  return {
    checksum: String(row.checksum),
    game: row.game as Game,
    name: String(row.name),
    date,
    source: row.source as DemoSource,
    type: row.type as DemoType,
    share_code: row.share_code as string | null,
    map_name: String(row.map_name),
    server_name: String(row.server_name),
    client_name: String(row.client_name),
    tick_count: Number(row.tick_count),
    tickrate: Number(row.tickrate),
    framerate: Number(row.framerate),
    duration: Number(row.duration),
    network_protocol: Number(row.network_protocol),
    build_number: Number(row.build_number),
  };
}

export async function parseMatchCsv(
  { outputFolderPath, demoName }: InsertOptions,
  demoPath: string,
): Promise<MatchRow> {
  const csvFilePath = getCsvFilePath(outputFolderPath, demoName, '_match.csv');
  const row = await parseCsvFirstRow<MatchRow>(
    csvFilePath,
    csvColumns<MatchRow>([
      ['checksum', 'string'],
      ['demo_path', 'string'],
      ['game_type', 'number'],
      ['game_mode', 'number'],
      ['game_mode_str', 'string'],
      ['is_ranked', 'boolean'],
      ['kill_count', 'number'],
      ['assist_count', 'number'],
      ['death_count', 'number'],
      ['shot_count', 'number'],
      ['winner_name', 'string'],
      ['winner_side', 'number'],
      ['overtime_count', 'number'],
      ['max_rounds', 'number'],
      ['has_vac_live_ban', 'boolean'],
    ]),
  );

  if (row === undefined) {
    throw new Error(`Match CSV is empty: ${csvFilePath}`);
  }

  return {
    ...row,
    demo_path: row.demo_path || demoPath,
    game_type: row.game_type as GameType,
    game_mode_str: row.game_mode_str as GameMode,
    winner_side: row.winner_side as TeamNumber,
    analyze_date: new Date(),
  };
}

export async function parseTeamsCsv(options: InsertOptions) {
  const csvFilePath = getCsvFilePath(options.outputFolderPath, options.demoName, '_teams.csv');
  const rows = await parseRows<TeamRow>(csvFilePath, [
    ['name', 'string'],
    ['letter', 'string'],
    ['score', 'number'],
    ['score_first_half', 'number'],
    ['score_second_half', 'number'],
    ['current_side', 'number'],
    ['match_checksum', 'string'],
  ]);

  return withIds(
    rows.map((row) => {
      return {
        ...row,
        letter: row.letter as TeamLetter,
        current_side: row.current_side as TeamNumber,
      };
    }),
  );
}

type PlayerCsvRow = Omit<MatchPlayerTable, 'id' | 'kill_death_ratio' | 'headshot_percentage'>;

export async function parsePlayersCsv(options: InsertOptions) {
  const csvFilePath = getCsvFilePath(options.outputFolderPath, options.demoName, '_players.csv');
  const rows = await parseRows<PlayerCsvRow>(csvFilePath, [
    ['name', 'string'],
    ['steam_id', 'string'],
    ['index', 'number'],
    ['score', 'number'],
    ['team_name', 'string'],
    ['kill_count', 'number'],
    ['assist_count', 'number'],
    ['death_count', 'number'],
    ['headshot_count', 'number'],
    ['kast', 'number'],
    ['average_damage_per_round', 'number'],
    ['average_kill_per_round', 'number'],
    ['average_death_per_round', 'number'],
    ['utility_damage_per_round', 'number'],
    ['mvp_count', 'number'],
    ['rank_type', 'number'],
    ['rank', 'number'],
    ['old_rank', 'number'],
    ['wins_count', 'number'],
    ['bomb_planted_count', 'number'],
    ['bomb_defused_count', 'number'],
    ['hostage_rescued_count', 'number'],
    ['damage_health', 'number'],
    ['damage_armor', 'number'],
    ['utility_damage', 'number'],
    ['first_kill_count', 'number'],
    ['first_death_count', 'number'],
    ['trade_kill_count', 'number'],
    ['trade_death_count', 'number'],
    ['first_trade_kill_count', 'number'],
    ['first_trade_death_count', 'number'],
    ['one_kill_count', 'number'],
    ['two_kill_count', 'number'],
    ['three_kill_count', 'number'],
    ['four_kill_count', 'number'],
    ['five_kill_count', 'number'],
    ['hltv_rating_2', 'number'],
    ['hltv_rating', 'number'],
    ['crosshair_share_code', 'string'],
    ['color', 'number'],
    ['inspect_weapon_count', 'number'],
    ['match_checksum', 'string'],
  ]);

  return withIds(
    rows.map((row) => {
      const killDeathRatio = roundNumber(row.kill_count / Math.max(row.death_count, 1), 2);
      const headshotPercentage = roundNumber((row.headshot_count * 100) / Math.max(row.kill_count, 1));
      return {
        ...row,
        kill_death_ratio: killDeathRatio,
        headshot_percentage: headshotPercentage,
      };
    }),
  );
}

export async function parseRoundsCsv(options: InsertOptions) {
  const csvFilePath = getCsvFilePath(options.outputFolderPath, options.demoName, '_rounds.csv');
  const rows = await parseRows<RoundTable>(csvFilePath, [
    ['number', 'number'],
    ['start_tick', 'number'],
    ['start_frame', 'number'],
    ['freeze_time_end_tick', 'number'],
    ['freeze_time_end_frame', 'number'],
    ['end_tick', 'number'],
    ['end_frame', 'number'],
    ['end_officially_tick', 'number'],
    ['end_officially_frame', 'number'],
    ['team_a_name', 'string'],
    ['team_b_name', 'string'],
    ['team_a_score', 'number'],
    ['team_b_score', 'number'],
    ['team_a_side', 'number'],
    ['team_b_side', 'number'],
    ['team_a_start_money', 'number'],
    ['team_b_start_money', 'number'],
    ['team_a_equipment_value', 'number'],
    ['team_b_equipment_value', 'number'],
    ['team_a_money_spent', 'number'],
    ['team_b_money_spent', 'number'],
    ['team_a_economy_type', 'string'],
    ['team_b_economy_type', 'string'],
    ['duration', 'number'],
    ['end_reason', 'number'],
    ['winner_name', 'string'],
    ['winner_side', 'number'],
    ['overtime_number', 'number'],
    ['match_checksum', 'string'],
  ]);
  return withIds(rows);
}

export async function parseKillsCsv(options: InsertOptions) {
  const csvFilePath = getCsvFilePath(options.outputFolderPath, options.demoName, '_kills.csv');
  const rows = await parseRows<KillTable>(csvFilePath, [
    ['frame', 'number'],
    ['tick', 'number'],
    ['round_number', 'number'],
    ['killer_name', 'string'],
    ['killer_steam_id', 'string'],
    ['killer_side', 'number'],
    ['killer_team_name', 'nullable-string'],
    ['victim_name', 'string'],
    ['victim_steam_id', 'string'],
    ['victim_side', 'number'],
    ['victim_team_name', 'nullable-string'],
    ['assister_name', 'nullable-string'],
    ['assister_steam_id', 'string'],
    ['assister_side', 'number'],
    ['assister_team_name', 'nullable-string'],
    ['weapon_name', 'string'],
    ['weapon_type', 'number'],
    ['is_headshot', 'boolean'],
    ['penetrated_objects', 'number'],
    ['is_assisted_flash', 'boolean'],
    ['is_killer_controlling_bot', 'boolean'],
    ['is_victim_controlling_bot', 'boolean'],
    ['is_assister_controlling_bot', 'boolean'],
    ['killer_x', 'number'],
    ['killer_y', 'number'],
    ['killer_z', 'number'],
    ['is_killer_airborne', 'boolean'],
    ['is_killer_blinded', 'boolean'],
    ['victim_x', 'number'],
    ['victim_y', 'number'],
    ['victim_z', 'number'],
    ['is_victim_airborne', 'boolean'],
    ['is_victim_blinded', 'boolean'],
    ['is_victim_inspecting_weapon', 'boolean'],
    ['assister_x', 'number'],
    ['assister_y', 'number'],
    ['assister_z', 'number'],
    ['is_trade_kill', 'boolean'],
    ['is_trade_death', 'boolean'],
    ['is_through_smoke', 'boolean'],
    ['is_no_scope', 'boolean'],
    ['distance', 'number'],
    ['match_checksum', 'string'],
  ]);
  return withIds(rows);
}

export async function parseShotsCsv(options: InsertOptions) {
  return withIds(
    await parseRows<ShotTable>(getCsvFilePath(options.outputFolderPath, options.demoName, '_shots.csv'), [
      ['frame', 'number'],
      ['tick', 'number'],
      ['round_number', 'number'],
      ['weapon_name', 'string'],
      ['weapon_id', 'string'],
      ['projectile_id', 'string'],
      ['x', 'number'],
      ['y', 'number'],
      ['z', 'number'],
      ['player_name', 'string'],
      ['player_steam_id', 'string'],
      ['player_team_name', 'string'],
      ['player_side', 'number'],
      ['is_player_controlling_bot', 'boolean'],
      ['player_yaw', 'number'],
      ['player_pitch', 'number'],
      ['player_velocity_x', 'number'],
      ['player_velocity_y', 'number'],
      ['player_velocity_z', 'number'],
      ['recoil_index', 'number'],
      ['aim_punch_angle_x', 'number'],
      ['aim_punch_angle_y', 'number'],
      ['view_punch_angle_x', 'number'],
      ['view_punch_angle_y', 'number'],
      ['match_checksum', 'string'],
    ]),
  );
}

export async function parseDamagesCsv(options: InsertOptions) {
  const rows = await parseRows<Omit<DamageTable, 'id' | 'victim_damage'>>(
    getCsvFilePath(options.outputFolderPath, options.demoName, '_damages.csv'),
    [
      ['frame', 'number'],
      ['tick', 'number'],
      ['round_number', 'number'],
      ['health_damage', 'number'],
      ['armor_damage', 'number'],
      ['victim_health', 'number'],
      ['victim_new_health', 'number'],
      ['victim_armor', 'number'],
      ['victim_new_armor', 'number'],
      ['attacker_steam_id', 'string'],
      ['attacker_side', 'number'],
      ['attacker_team_name', 'string'],
      ['is_attacker_controlling_bot', 'boolean'],
      ['victim_steam_id', 'string'],
      ['victim_side', 'number'],
      ['victim_team_name', 'string'],
      ['is_victim_controlling_bot', 'boolean'],
      ['weapon_name', 'string'],
      ['weapon_type', 'number'],
      ['hitgroup', 'number'],
      ['weapon_unique_id', 'string'],
      ['match_checksum', 'string'],
    ],
  );

  return withIds(
    rows.map((row) => {
      return {
        ...row,
        victim_damage: row.health_damage,
      };
    }),
  );
}

export async function parseClutchesCsv(options: InsertOptions) {
  const csvFilePath = getCsvFilePath(options.outputFolderPath, options.demoName, '_clutches.csv');
  return withIds(
    await parseRows<ClutchTable>(csvFilePath, [
      ['frame', 'number'],
      ['tick', 'number'],
      ['round_number', 'number'],
      ['opponent_count', 'number'],
      ['side', 'number'],
      ['won', 'boolean'],
      ['clutcher_steam_id', 'string'],
      ['clutcher_name', 'string'],
      ['has_clutcher_survived', 'boolean'],
      ['clutcher_kill_count', 'number'],
      ['match_checksum', 'string'],
    ]),
  );
}

export async function parseBlindsCsv(options: InsertOptions) {
  return withIds(
    await parseRows<PlayerBlindTable>(
      getCsvFilePath(options.outputFolderPath, options.demoName, '_players_flashed.csv'),
      [
        ['frame', 'number'],
        ['tick', 'number'],
        ['round_number', 'number'],
        ['duration', 'number'],
        ['flashed_steam_id', 'string'],
        ['flashed_name', 'string'],
        ['flashed_side', 'number'],
        ['is_flashed_controlling_bot', 'boolean'],
        ['flasher_steam_id', 'string'],
        ['flasher_name', 'string'],
        ['flasher_side', 'number'],
        ['is_flasher_controlling_bot', 'boolean'],
        ['match_checksum', 'string'],
      ],
    ),
  );
}

export async function parseEconomiesCsv(options: InsertOptions) {
  return withIds(
    await parseRows<PlayerEconomyTable>(
      getCsvFilePath(options.outputFolderPath, options.demoName, '_players_economy.csv'),
      [
        ['player_steam_id', 'string'],
        ['player_name', 'string'],
        ['player_side', 'number'],
        ['start_money', 'number'],
        ['money_spent', 'number'],
        ['equipment_value', 'number'],
        ['type', 'string'],
        ['round_number', 'number'],
        ['match_checksum', 'string'],
      ],
    ),
  );
}

export async function parseBuysCsv(options: InsertOptions) {
  const csvFilePath = getCsvFilePath(options.outputFolderPath, options.demoName, '_players_buy.csv');
  return withIds(
    await parseRows<PlayerBuyTable>(csvFilePath, [
      ['frame', 'number'],
      ['tick', 'number'],
      ['round_number', 'number'],
      ['player_steam_id', 'string'],
      ['player_side', 'number'],
      ['player_name', 'string'],
      ['weapon_name', 'string'],
      ['weapon_type', 'number'],
      ['weapon_unique_id', 'string'],
      ['has_refunded', 'boolean'],
      ['match_checksum', 'string'],
    ]),
  );
}

export async function parseChatMessagesCsv(options: InsertOptions) {
  return withIds(
    await parseRows<ChatMessageTable>(
      getCsvFilePath(options.outputFolderPath, options.demoName, '_chat_messages.csv'),
      [
        ['frame', 'number'],
        ['tick', 'number'],
        ['round_number', 'number'],
        ['sender_steam_id', 'string'],
        ['sender_name', 'string'],
        ['message', 'string'],
        ['sender_is_alive', 'boolean'],
        ['sender_side', 'number'],
        ['match_checksum', 'string'],
      ],
    ),
  );
}

const grenadeWithNameColumns: Array<[string, CsvValueType]> = [
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
];

const grenadeWithoutNameColumns: Array<[string, CsvValueType]> = [
  ['frame', 'number'],
  ['tick', 'number'],
  ['round_number', 'number'],
  ['grenade_id', 'string'],
  ['projectile_id', 'string'],
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
];

export async function parseGrenadeBouncesCsv(options: InsertOptions) {
  return withIds(
    await parseRows<GrenadeBounceTable>(
      getCsvFilePath(options.outputFolderPath, options.demoName, '_grenade_bounces.csv'),
      grenadeWithNameColumns,
    ),
  );
}

export async function parseGrenadeProjectilesDestroyCsv(options: InsertOptions) {
  return withIds(
    await parseRows<GrenadeProjectileDestroyTable>(
      getCsvFilePath(options.outputFolderPath, options.demoName, '_grenade_projectiles_destroy.csv'),
      grenadeWithNameColumns,
    ),
  );
}

export async function parseHeGrenadesCsv(options: InsertOptions) {
  return withIds(
    await parseRows<HeGrenadeExplodeTable>(
      getCsvFilePath(options.outputFolderPath, options.demoName, '_he_grenades_explode.csv'),
      grenadeWithoutNameColumns,
    ),
  );
}

export async function parseSmokesCsv(options: InsertOptions) {
  return withIds(
    await parseRows<SmokeStartTable>(
      getCsvFilePath(options.outputFolderPath, options.demoName, '_smokes_start.csv'),
      grenadeWithoutNameColumns,
    ),
  );
}

export async function parseDecoysCsv(options: InsertOptions) {
  return withIds(
    await parseRows<DecoyStartTable>(
      getCsvFilePath(options.outputFolderPath, options.demoName, '_decoys_start.csv'),
      grenadeWithoutNameColumns,
    ),
  );
}

export async function parseFlashbangsCsv(options: InsertOptions) {
  return withIds(
    await parseRows<FlashbangExplodeTable>(
      getCsvFilePath(options.outputFolderPath, options.demoName, '_flashbangs_explode.csv'),
      grenadeWithoutNameColumns,
    ),
  );
}

export async function parseBombsCsv(options: InsertOptions) {
  const plantedPath = getCsvFilePath(options.outputFolderPath, options.demoName, '_bombs_planted.csv');
  const defusedPath = getCsvFilePath(options.outputFolderPath, options.demoName, '_bombs_defused.csv');
  const explodedPath = getCsvFilePath(options.outputFolderPath, options.demoName, '_bombs_exploded.csv');
  const [planted, defused, exploded, plantStart, defuseStart] = await Promise.all([
    parseRows<BombPlantedTable>(plantedPath, [
      ['frame', 'number'],
      ['tick', 'number'],
      ['round_number', 'number'],
      ['site', 'string'],
      ['planter_steam_id', 'string'],
      ['planter_name', 'string'],
      ['is_planter_controlling_bot', 'boolean'],
      ['x', 'number'],
      ['y', 'number'],
      ['z', 'number'],
      ['match_checksum', 'string'],
    ]),
    parseRows<BombDefusedTable>(defusedPath, [
      ['frame', 'number'],
      ['tick', 'number'],
      ['round_number', 'number'],
      ['site', 'string'],
      ['defuser_steam_id', 'string'],
      ['defuser_name', 'string'],
      ['is_defuser_controlling_bot', 'boolean'],
      ['x', 'number'],
      ['y', 'number'],
      ['z', 'number'],
      ['ct_alive_count', 'number'],
      ['t_alive_count', 'number'],
      ['match_checksum', 'string'],
    ]),
    parseRows<BombExplodedTable>(explodedPath, [
      ['frame', 'number'],
      ['tick', 'number'],
      ['round_number', 'number'],
      ['site', 'string'],
      ['planter_steam_id', 'string'],
      ['planter_name', 'string'],
      ['is_planter_controlling_bot', 'boolean'],
      ['x', 'number'],
      ['y', 'number'],
      ['z', 'number'],
      ['match_checksum', 'string'],
    ]),
    parseRows<BombPlantStartTable>(
      getCsvFilePath(options.outputFolderPath, options.demoName, '_bombs_plant_start.csv'),
      [
        ['frame', 'number'],
        ['tick', 'number'],
        ['round_number', 'number'],
        ['site', 'string'],
        ['planter_steam_id', 'string'],
        ['planter_name', 'string'],
        ['is_planter_controlling_bot', 'boolean'],
        ['x', 'number'],
        ['y', 'number'],
        ['z', 'number'],
        ['match_checksum', 'string'],
      ],
    ),
    parseRows<BombDefuseStartTable>(
      getCsvFilePath(options.outputFolderPath, options.demoName, '_bombs_defuse_start.csv'),
      [
        ['frame', 'number'],
        ['tick', 'number'],
        ['round_number', 'number'],
        ['defuser_steam_id', 'string'],
        ['defuser_name', 'string'],
        ['is_defuser_controlling_bot', 'boolean'],
        ['x', 'number'],
        ['y', 'number'],
        ['z', 'number'],
        ['match_checksum', 'string'],
      ],
    ),
  ]);

  return {
    planted: withIds(planted),
    defused: withIds(defused),
    exploded: withIds(exploded),
    plantStart: withIds(plantStart),
    defuseStart: withIds(defuseStart),
  };
}

export async function parseHostagesCsv(options: InsertOptions) {
  const [rescued, pickUpStart, pickedUp] = await Promise.all([
    parseRows<HostageRescuedTable>(getCsvFilePath(options.outputFolderPath, options.demoName, '_hostage_rescued.csv'), [
      ['frame', 'number'],
      ['tick', 'number'],
      ['round_number', 'number'],
      ['player_steam_id', 'string'],
      ['is_player_controlling_bot', 'boolean'],
      ['hostage_entity_id', 'number'],
      ['x', 'number'],
      ['y', 'number'],
      ['z', 'number'],
      ['match_checksum', 'string'],
    ]),
    parseRows<HostagePickUpStartTable>(
      getCsvFilePath(options.outputFolderPath, options.demoName, '_hostage_pick_up_start.csv'),
      [
        ['frame', 'number'],
        ['tick', 'number'],
        ['round_number', 'number'],
        ['player_steam_id', 'string'],
        ['is_player_controlling_bot', 'boolean'],
        ['hostage_entity_id', 'number'],
        ['x', 'number'],
        ['y', 'number'],
        ['z', 'number'],
        ['match_checksum', 'string'],
      ],
    ),
    parseRows<HostagePickedUpTable>(
      getCsvFilePath(options.outputFolderPath, options.demoName, '_hostage_picked_up.csv'),
      [
        ['frame', 'number'],
        ['tick', 'number'],
        ['round_number', 'number'],
        ['player_steam_id', 'string'],
        ['is_player_controlling_bot', 'boolean'],
        ['hostage_entity_id', 'number'],
        ['x', 'number'],
        ['y', 'number'],
        ['z', 'number'],
        ['match_checksum', 'string'],
      ],
    ),
  ]);

  return {
    rescued: withIds(rescued),
    pickUpStart: withIds(pickUpStart),
    pickedUp: withIds(pickedUp),
  };
}

export async function parseChickenDeathsCsv(options: InsertOptions) {
  return withIds(
    await parseRows<ChickenDeathTable>(
      getCsvFilePath(options.outputFolderPath, options.demoName, '_chicken_deaths.csv'),
      [
        ['frame', 'number'],
        ['tick', 'number'],
        ['round_number', 'number'],
        ['killer_steam_id', 'string'],
        ['weapon_name', 'string'],
        ['match_checksum', 'string'],
      ],
    ),
  );
}
