import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vite-plus/test';
import type { Sequence } from 'csdm/common/types/sequence';
import { EncoderSoftware } from 'csdm/common/types/encoder-software';
import { RecordingOutput } from 'csdm/common/types/recording-output';
import { RecordingSystem } from 'csdm/common/types/recording-system';
import { VideoContainer } from 'csdm/common/types/video-container';
import { createCs2VideoJsonFile } from './create-cs2-video-json-file';

type Action = {
  tick: number;
  cmd: string;
};

type ActionSequence = {
  actions: Action[];
};

function createSequence(overrides: Partial<Sequence> & Pick<Sequence, 'number' | 'startTick' | 'endTick'>): Sequence {
  return {
    showXRay: false,
    showLargePlayerCount: true,
    showAssists: true,
    showOnlyDeathNotices: true,
    playersOptions: [],
    playerCameras: [],
    cameras: [],
    playerVoicesEnabled: false,
    recordAudio: true,
    deathNoticesDuration: 5,
    ...overrides,
  };
}

async function generateActions(options: {
  sequences: Sequence[];
  mirvPov?: boolean;
  closeGameAfterRecording?: boolean;
  type?: 'record' | 'watch';
}) {
  const directory = await mkdtemp(path.join(tmpdir(), 'csdm-video-json-'));
  const demoPath = path.join(directory, 'demo.dem');

  try {
    await createCs2VideoJsonFile({
      type: options.type ?? 'record',
      recordingSystem: RecordingSystem.HLAE,
      recordingOutput: RecordingOutput.Video,
      encoderSoftware: EncoderSoftware.FFmpeg,
      outputFolderPath: directory,
      framerate: 60,
      demoPath,
      sequences: options.sequences,
      closeGameAfterRecording: options.closeGameAfterRecording ?? true,
      trueView: false,
      mirvPov: options.mirvPov ?? false,
      tickrate: 64,
      players: [],
      cameras: [],
      ffmpegSettings: {
        constantRateFactor: 23,
        videoContainer: VideoContainer.MP4,
        videoCodec: 'libx264',
        outputParameters: '',
      },
    });

    const content = await readFile(`${demoPath}.json`, 'utf8');
    return JSON.parse(content) as ActionSequence[];
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

describe('createCs2VideoJsonFile sequence timeline', () => {
  it('skips chronological clips on one timeline instead of rewinding to tick 0', async () => {
    const sequences = await generateActions({
      sequences: [
        createSequence({ number: 1, startTick: 2000, endTick: 2500 }),
        createSequence({ number: 2, startTick: 8000, endTick: 8500 }),
      ],
      mirvPov: true,
    });

    expect(sequences).toHaveLength(1);

    const actions = sequences[0].actions;
    expect(actions.some((action) => action.cmd === 'go_to_next_sequence')).toBe(false);
    expect(actions.some((action) => action.tick === 2500 + 320)).toBe(false);
    expect(actions).toContainEqual({ tick: 96, cmd: 'sv_cheats 1' });
    expect(actions).toContainEqual({ tick: 96, cmd: 'demo_gototick 1935' });
    expect(actions).toContainEqual({ tick: 2501, cmd: 'pause_playback' });
    expect(actions).toContainEqual({ tick: 2502, cmd: 'demo_gototick 7935' });
    expect(actions).toContainEqual({ tick: 8502, cmd: 'quit' });

    const secondClipRecordName = actions.find(
      (action) => action.cmd.includes('mirv_streams record name') && action.cmd.includes('2-sequence'),
    );
    expect(secondClipRecordName?.tick).toBe(7936);
    expect(actions.some((action) => action.tick === 96 && action.cmd.includes('2-sequence'))).toBe(false);
  });

  it('rewinds only when the next clip starts earlier than the current end', async () => {
    const sequences = await generateActions({
      sequences: [
        createSequence({ number: 1, startTick: 8000, endTick: 8500 }),
        createSequence({ number: 2, startTick: 2000, endTick: 2500 }),
      ],
    });

    expect(sequences).toHaveLength(2);
    expect(sequences[0].actions).toContainEqual({ tick: 8502, cmd: 'go_to_next_sequence' });
    expect(sequences[1].actions).toContainEqual({ tick: 96, cmd: 'sv_cheats 1' });
    expect(sequences[1].actions).toContainEqual({ tick: 96, cmd: 'demo_gototick 1935' });
  });

  it('pauses after record end when watching is not requested', async () => {
    const sequences = await generateActions({
      type: 'watch',
      closeGameAfterRecording: false,
      sequences: [
        createSequence({ number: 1, startTick: 2000, endTick: 2500 }),
        createSequence({ number: 2, startTick: 8000, endTick: 8500 }),
      ],
    });

    const actions = sequences[0].actions;
    expect(actions.some((action) => action.cmd === 'mirv_streams record start')).toBe(false);
    expect(actions).toContainEqual({ tick: 2501, cmd: 'demo_gototick 7935' });
    expect(actions.some((action) => action.tick === 2501 && action.cmd === 'pause_playback')).toBe(false);
  });
});
