import React from 'react';
import { Trans } from '@lingui/react/macro';
import { RecordingGameWidth } from './recording-game-width';
import { RecordingGameHeight } from './recording-game-height';
import { RecordingOutputWidth } from './recording-output-width';
import { RecordingOutputHeight } from './recording-output-height';
import { RecordingStretchVideo } from './recording-stretch-video';
import { RecordingXRay } from './recording-x-ray';
import { RecordingLargePlayerCount } from './recording-large-player-count';
import { RecordingPlayerVoices } from './recording-player-voices';
import { RecordingDeathNoticesDuration } from './recording-death-notices-duration';
import { RecordingShowOnlyDeathNotices } from './recording-show-only-death-notices';
import { RecordingAssists } from './recording-assists';
import { RecordingAudio } from './recording-audio';

export function DefaultVideoRecordingSettings() {
  return (
    <div>
      <h2 className="mb-8 text-subtitle">
        <Trans>Default recording settings</Trans>
      </h2>
      <div className="flex flex-col gap-y-8">
        <RecordingGameWidth />
        <RecordingGameHeight />
        <RecordingOutputWidth />
        <RecordingOutputHeight />
        <RecordingStretchVideo />
        <RecordingXRay />
        <RecordingLargePlayerCount />
        <RecordingAssists />
        <RecordingAudio />
        <RecordingPlayerVoices />
        <RecordingShowOnlyDeathNotices />
        {window.csdm.isWindows && <RecordingDeathNoticesDuration />}
      </div>
    </div>
  );
}
