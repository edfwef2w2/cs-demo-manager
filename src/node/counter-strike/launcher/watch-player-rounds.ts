import { Game } from 'csdm/common/types/counter-strike';
import { startCounterStrike } from './start-counter-strike';
import { detectDemoGame } from './detect-demo-game';
import { deleteJsonActionsFile } from '../json-actions-file/delete-json-actions-file';
import { getDemoChecksumFromDemoPath } from 'csdm/node/demo/get-demo-checksum-from-demo-path';
import { NoRoundsFound } from './errors/not-rounds-found';
import { generatePlayerRoundsJsonFile } from '../json-actions-file/generate-player-rounds-json-file';
import { getSettings } from 'csdm/node/settings/get-settings';
import { watchDemoWithHlae } from './watch-demo-with-hlae';
import { fetchMatchPlayersSlots } from 'csdm/node/database/match/fetch-match-players-slots';
import type { PlayerWatchInfo } from 'csdm/common/types/player-watch-info';
import { readMatchDocument, readMatchEvents } from 'csdm/node/store/match-io';
import type { KillRow } from 'csdm/node/database/kills/kill-table';

export type Round = {
  number: number;
  tickEnd: number;
  freezeTimeEndTick: number;
  deathTick: number | null;
  killerSteamId: string | null;
};

async function fetchRounds(checksum: string, steamId: string) {
  const document = await readMatchDocument(checksum);
  const kills = await readMatchEvents<KillRow>(checksum, 'kills');
  const rounds: Round[] = (document?.rounds ?? [])
    .toSorted((left, right) => left.freeze_time_end_tick - right.freeze_time_end_tick)
    .map((round) => {
      const death = kills.find((kill) => kill.round_number === round.number && kill.victim_steam_id === steamId);
      return {
        number: round.number,
        tickEnd: round.end_tick,
        freezeTimeEndTick: round.freeze_time_end_tick,
        deathTick: death?.tick ?? null,
        killerSteamId: death?.killer_steam_id ?? null,
      };
    });

  return rounds;
}

async function fetchDemoTickrate(checksum: string) {
  const document = await readMatchDocument(checksum);
  return document?.demo.tickrate ?? 64;
}

type Options = {
  demoPath: string;
  steamId: string;
  onGameStart: () => void;
};

export async function watchPlayerRounds({ demoPath, steamId, onGameStart }: Options) {
  const game = await detectDemoGame(demoPath);
  await deleteJsonActionsFile(demoPath);

  const checksum = await getDemoChecksumFromDemoPath(demoPath);
  const rounds = await fetchRounds(checksum, steamId);
  if (rounds.length === 0) {
    throw new NoRoundsFound();
  }

  const settings = await getSettings();
  const { round, playerVoicesEnabled } = settings.playback;
  const { beforeRoundDelayInSeconds, afterRoundDelayInSeconds, waitForRoundEnd } = round;
  let players: PlayerWatchInfo[] = [];
  let playerId: number | string = steamId;
  if (game !== Game.CSGO) {
    players = await fetchMatchPlayersSlots(checksum);
    const player = players.find((player) => player.steamId === steamId);
    if (!player) {
      throw new NoRoundsFound();
    }
    playerId = player.slot;
  }

  const tickrate = await fetchDemoTickrate(checksum);
  await generatePlayerRoundsJsonFile({
    tickrate,
    demoPath,
    game,
    rounds,
    playerId,
    beforeDelaySeconds: beforeRoundDelayInSeconds,
    afterDelaySeconds: afterRoundDelayInSeconds,
    waitForRoundEnd,
    playerVoicesEnabled,
    players,
  });

  if (settings.playback.useHlae) {
    await watchDemoWithHlae({
      demoPath,
      game,
      onGameStart,
    });
  } else {
    await startCounterStrike({
      demoPath,
      game,
      onGameStart,
    });
  }
}
