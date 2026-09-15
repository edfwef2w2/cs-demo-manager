import type { Sequence } from 'csdm/common/types/sequence';
import { getSequenceName } from 'csdm/node/video/generation/get-sequence-name';
import { JSONActionsFileGenerator } from 'csdm/node/counter-strike/json-actions-file/json-actions-file-generator';
import { Game } from 'csdm/common/types/counter-strike';
import { generatePlayerVoicesValues } from 'csdm/node/counter-strike/launcher/generate-player-voices-values';
import type { PlayerWatchInfo } from 'csdm/common/types/player-watch-info';
import { windowsToUnixPathSeparator } from 'csdm/node/filesystem/windows-to-unix-path-separator';
import type { RecordingOutput } from 'csdm/common/types/recording-output';
import { RecordingSystem } from 'csdm/common/types/recording-system';
import type { EncoderSoftware } from 'csdm/common/types/encoder-software';
import type { VideoContainer } from 'csdm/common/types/video-container';
import type { Camera } from 'csdm/common/types/camera';
import {
  MIRV_POV_ENABLE_COMMAND,
  MIRV_POV_OFFLINE_LOCKDOWN_COMMANDS,
  getCs2DeathNoticesDrawCommand,
  shouldEnableMirvPov,
  shouldShowXRay,
} from 'csdm/node/video/hlae/mirv-pov-commands';
import { getLargePlayerCountCommand } from 'csdm/node/video/generation/get-large-player-count-command';
import {
  getCs2HlaeScreenPresetName,
  isCustomCs2HlaeFfmpegPreset,
} from 'csdm/node/video/generation/get-cs2-hlae-screen-preset-name';
import { getCs2HlaeFfmpegPresetOptions } from 'csdm/node/video/generation/get-cs2-hlae-ffmpeg-preset-options';

function getHlaeOutputFolderPath(outputFolderPath: string, sequence: Sequence) {
  return `${windowsToUnixPathSeparator(outputFolderPath)}/${getSequenceName(sequence)}`;
}

type Options = {
  type: 'record' | 'watch';
  recordingSystem: RecordingSystem;
  recordingOutput: RecordingOutput;
  encoderSoftware: EncoderSoftware;
  outputFolderPath: string;
  framerate: number;
  demoPath: string;
  sequences: Sequence[];
  closeGameAfterRecording: boolean;
  trueView: boolean;
  mirvPov?: boolean;
  tickrate: number;
  players: PlayerWatchInfo[];
  cameras: Camera[];
  ffmpegSettings: {
    constantRateFactor: number;
    videoContainer: VideoContainer;
    videoCodec: string;
    outputParameters: string;
  };
  width?: number;
  height?: number;
  outputWidth?: number;
  outputHeight?: number;
  stretchVideo?: boolean;
};

export async function createCs2VideoJsonFile({
  type,
  recordingSystem,
  recordingOutput,
  encoderSoftware,
  outputFolderPath,
  framerate,
  demoPath,
  sequences,
  closeGameAfterRecording,
  trueView,
  mirvPov = false,
  tickrate,
  players,
  cameras,
  ffmpegSettings,
  width,
  height,
  outputWidth,
  outputHeight,
  stretchVideo,
}: Options) {
  const json = new JSONActionsFileGenerator(demoPath, Game.CS2);
  const mirvPovEnabled = shouldEnableMirvPov(mirvPov, recordingSystem === RecordingSystem.HLAE);

  const mandatoryCommands = [
    'sv_cheats 1',
    'volume 1',
    // Hide demo scrubber UI (must also be set before playdemo via launch options).
    'demo_ui_mode 0',
    // Prevent CS2 from sleeping / locking FPS when the window is unfocused or minimized.
    'engine_no_focus_sleep 0',
    'cl_hud_telemetry_frametime_show 0',
    'cl_hud_telemetry_net_misdelivery_show 0',
    'cl_hud_telemetry_ping_show 0',
    'cl_hud_telemetry_serverrecvmargin_graph_show 0',
    'cl_trueview_show_status 0',
    'r_show_build_info 0',
    'mirv_streams record screen enabled 1',
    `cl_demo_predict ${trueView ? 1 : 0}`,
  ];
  if (mirvPovEnabled) {
    mandatoryCommands.push(MIRV_POV_ENABLE_COMMAND);
    mandatoryCommands.push(...MIRV_POV_OFFLINE_LOCKDOWN_COMMANDS);
  }

  const roundedTickrate = Math.round(tickrate);

  for (let i = 0; i < sequences.length; i++) {
    const sequence = sequences[i];
    const previousSequence = i > 0 ? sequences[i - 1] : undefined;
    const setupSequenceTick = Math.max(1, sequence.startTick - roundedTickrate);
    // Overlapping or earlier clips need a sequence restart (rewind). Chronological clips stay on one
    // timeline and skip ahead, which is what highlight playback already does.
    const shouldRewindToStart = previousSequence !== undefined && setupSequenceTick <= previousSequence.endTick;
    const startsNewActionSequence = i === 0 || shouldRewindToStart;

    if (startsNewActionSequence) {
      for (const command of mandatoryCommands) {
        json.addExecCommand(1, command);
      }

      json.addExecCommand(1, getCs2DeathNoticesDrawCommand(sequence.showOnlyDeathNotices, mirvPovEnabled));
      json.addExecCommand(1, `mirv_deathmsg lifetime ${sequence.deathNoticesDuration}`);
      json.addExecCommand(1, `mirv_deathmsg filter clear`);

      if (sequence.playerVoicesEnabled) {
        json.enablePlayerVoices(1);
      } else {
        json.disablePlayerVoices(1);
      }

      // Go to 1 tick before the sequence's setup tick to make sure the setup commands are executed.
      // It may not if we do both the skip ahead and the setup cmds at the same tick.
      // Since an October 2025 CS2 update, executing spec_player and demo_gototick on the same tick may cause
      // spec_player to be ignored. It's important to go to the setup tick before executing any spec_player command.
      // https://github.com/akiver/cs-demo-manager/issues/1238
      json.addGoToTick(1, Math.max(1, setupSequenceTick - 1));
    } else if (previousSequence) {
      const skipFromTick = type === 'record' ? previousSequence.endTick + 2 : previousSequence.endTick + 1;
      json.addGoToTick(skipFromTick, Math.max(1, setupSequenceTick - 1));
    }

    const hlaeOutputFolderPath = getHlaeOutputFolderPath(outputFolderPath, sequence);
    const presetName = getCs2HlaeScreenPresetName({
      recordingOutput,
      encoderSoftware,
      sequenceNumber: sequence.number,
    });

    json
      .addExecCommand(setupSequenceTick, getCs2DeathNoticesDrawCommand(sequence.showOnlyDeathNotices, mirvPovEnabled))
      .addExecCommand(setupSequenceTick, `mirv_deathmsg lifetime ${sequence.deathNoticesDuration}`)
      .addExecCommand(setupSequenceTick, `mirv_streams record startMovieWav ${sequence.recordAudio ? 1 : 0}`)
      .addExecCommand(setupSequenceTick, `mirv_streams record name "${hlaeOutputFolderPath}"`)
      .addExecCommand(setupSequenceTick, `mirv_deathmsg clear`)
      .addExecCommand(setupSequenceTick, `spec_show_xray ${shouldShowXRay(sequence.showXRay, mirvPovEnabled) ? 1 : 0}`)
      .addExecCommand(setupSequenceTick, `mp_display_kill_assists ${sequence.showAssists ? 1 : 0}`)
      .addExecCommand(setupSequenceTick, getLargePlayerCountCommand(Game.CS2, sequence.showLargePlayerCount === true));

    if (sequence.playerVoicesEnabled) {
      json.enablePlayerVoices(setupSequenceTick);
    } else {
      json.disablePlayerVoices(setupSequenceTick);
    }

    if (isCustomCs2HlaeFfmpegPreset(presetName)) {
      const presetParameters = getCs2HlaeFfmpegPresetOptions({
        videoCodec: ffmpegSettings.videoCodec,
        constantRateFactor: ffmpegSettings.constantRateFactor,
        outputParameters: ffmpegSettings.outputParameters,
        videoContainer: ffmpegSettings.videoContainer,
        mirvPovEnabled,
        width,
        height,
        outputWidth,
        outputHeight,
        stretchVideo,
      });
      json
        .addExecCommand(setupSequenceTick, `mirv_streams settings add ffmpeg ${presetName} "${presetParameters}"`)
        .addExecCommand(setupSequenceTick, `mirv_streams record screen settings ${presetName}`);
    }

    if (recordingSystem === RecordingSystem.HLAE) {
      json.addExecCommand(setupSequenceTick, `mirv_streams record fps ${framerate}`);
    } else {
      json.addExecCommand(setupSequenceTick, `host_framerate ${framerate}`);
    }

    if (typeof sequence.cfg === 'string') {
      const commands = sequence.cfg.split('\n');
      for (const command of commands) {
        json.addExecCommand(setupSequenceTick, command);
      }
    }

    // Pause the playback for a few seconds to avoid seeing the loading screen/tint effect.
    // Do it a few ticks before the sequence's start tick because some ticks may be skipped between the time that the
    // plugin pauses the playback and the time that the game actually pauses the playback (it would result in
    // startmovie commands not being executed and so missing sequences).
    json.addPausePlayback(Math.max(1, sequence.startTick - 4));

    for (const camera of sequence.playerCameras) {
      const player = players.find((player) => player.steamId === camera.playerSteamId);
      if (player) {
        json.addSpecPlayer(camera.tick, player.slot);
      }
    }
    for (const { id, tick } of sequence.cameras) {
      const camera = cameras.find((camera) => id === camera.id);
      if (camera) {
        json.addFocusCamera(tick, camera);
      }
    }

    json.addExecCommand(setupSequenceTick, `mirv_deathmsg filter clear`);
    if (sequence.playersOptions.length > 0) {
      // Block all death notices by default and then selectively allow them based on player's options.
      json.addExecCommand(setupSequenceTick, `mirv_deathmsg filter add block=1`);
    }

    for (const playerOptions of sequence.playersOptions) {
      // Unlike CS:GO, support for double quotes in player's name is not supported in CS2.
      // The reason is that the "mirv_exec" command used as a workaround in CS:GO is not available for CS2.
      const replacePlayerNameCommand = `mirv_replace_name byXuid add x${playerOptions.steamId} "${playerOptions.playerName}"`;
      json.addExecCommand(setupSequenceTick, replacePlayerNameCommand);

      if (playerOptions.showKill) {
        json.addExecCommand(
          setupSequenceTick,
          `mirv_deathmsg filter add attackerMatch=x${playerOptions.steamId} attackerIsLocal=${playerOptions.highlightKill ? '1' : '0'} block=0`,
        );
      }

      if (playerOptions.isVoiceEnabled) {
        const playersWithVoiceEnabled = sequence.playersOptions.filter((playerOptions) => playerOptions.isVoiceEnabled);
        if (playersWithVoiceEnabled.length !== sequence.playersOptions.length) {
          const userIds: number[] = [];
          for (const playerOptions of playersWithVoiceEnabled) {
            const player = players.find((player) => player.steamId === playerOptions.steamId);
            if (player) {
              userIds.push(player.userId);
            }
          }
          const { valueLow, valueHigh } = generatePlayerVoicesValues(userIds);
          json.addExecCommand(setupSequenceTick, `tv_listen_voice_indices ${valueLow}`);
          json.addExecCommand(setupSequenceTick, `tv_listen_voice_indices_h ${valueHigh}`);
        }
      }
    }

    if (type === 'record') {
      if (recordingSystem === RecordingSystem.HLAE) {
        json
          .addExecCommand(sequence.startTick, `mirv_streams record start`)
          .addExecCommand(sequence.endTick, 'mirv_streams record end');
      } else {
        json
          .addExecCommand(sequence.startTick, `startmovie ${getSequenceName(sequence)}`)
          .addExecCommand(sequence.endTick, 'endmovie');
      }
      // Freeze on the last recorded frame so HLAE can flush without capturing more gameplay
      // or a rewind to tick 0.
      json.addPausePlayback(sequence.endTick + 1);
    }

    const nextSequence = sequences[i + 1];
    const isLastSequence = nextSequence === undefined;
    const nextSetupTick =
      nextSequence === undefined ? undefined : Math.max(1, nextSequence.startTick - roundedTickrate);
    const nextSequenceRequiresRewind = nextSetupTick !== undefined && nextSetupTick <= sequence.endTick;

    if (isLastSequence && closeGameAfterRecording) {
      json.addExecCommand(sequence.endTick + 2, 'quit');
    } else if (nextSequenceRequiresRewind) {
      json.addGoToNextSequence(sequence.endTick + 2);
    }
  }

  await json.write();
}
