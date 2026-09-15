import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vite-plus/test';
import type { Sequence } from 'csdm/common/types/sequence';
import { EncoderSoftware } from 'csdm/common/types/encoder-software';
import { RecordingOutput } from 'csdm/common/types/recording-output';
import { RecordingSystem } from 'csdm/common/types/recording-system';
import { VideoContainer } from 'csdm/common/types/video-container';
import { createCsgoVideoJsonFile } from './create-csgo-video-json-file';

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

async function generateActions(sequences: Sequence[]) {
  const directory = await mkdtemp(path.join(tmpdir(), 'csdm-csgo-video-json-'));
  const demoPath = path.join(directory, 'demo.dem');

  try {
    await createCsgoVideoJsonFile({
      type: 'record',
      recordingSystem: RecordingSystem.HLAE,
      recordingOutput: RecordingOutput.Video,
      encoderSoftware: EncoderSoftware.FFmpeg,
      outputFolderPath: directory,
      framerate: 60,
      demoPath,
      sequences,
      closeGameAfterRecording: true,
      tickrate: 64,
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

describe('createCsgoVideoJsonFile sequence timeline', () => {
  it('skips chronological clips on one timeline instead of rewinding to tick 0', async () => {
    const sequences = await generateActions([
      createSequence({ number: 1, startTick: 2000, endTick: 2500 }),
      createSequence({ number: 2, startTick: 8000, endTick: 8500 }),
    ]);

    expect(sequences).toHaveLength(1);

    const actions = sequences[0].actions;
    expect(actions.some((action) => action.cmd === 'go_to_next_sequence')).toBe(false);
    expect(actions).toContainEqual({ tick: 96, cmd: 'demo_gototick 1936' });
    expect(actions).toContainEqual({ tick: 2501, cmd: 'demo_gototick 7936' });
    expect(actions).toContainEqual({ tick: 8501, cmd: 'quit' });
  });

  it('rewinds only when the next clip starts earlier than the current end', async () => {
    const sequences = await generateActions([
      createSequence({ number: 1, startTick: 8000, endTick: 8500 }),
      createSequence({ number: 2, startTick: 2000, endTick: 2500 }),
    ]);

    expect(sequences).toHaveLength(2);
    expect(sequences[0].actions).toContainEqual({ tick: 8501, cmd: 'go_to_next_sequence' });
    expect(sequences[1].actions).toContainEqual({ tick: 96, cmd: 'demo_gototick 1936' });
  });
});
