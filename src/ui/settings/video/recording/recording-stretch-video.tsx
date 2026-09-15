import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { Switch } from 'csdm/ui/components/inputs/switch';

export function RecordingStretchVideo() {
  const { settings, updateSettings } = useVideoSettings();

  return (
    <SettingsEntry
      interactiveComponent={
        <Switch
          isChecked={settings.stretchVideo}
          onChange={async (isChecked) => {
            await updateSettings({ stretchVideo: isChecked });
          }}
        />
      }
      description={
        <p>
          <Trans>
            Stretch the recorded game picture to the output resolution instead of adding black bars when the aspect
            ratio differs.
          </Trans>
        </p>
      }
      title={<Trans context="Settings title">Stretch to output resolution</Trans>}
    />
  );
}
