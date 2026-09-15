import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { Switch } from 'csdm/ui/components/inputs/switch';

export function RecordingLargePlayerCount() {
  const { settings, updateSettings } = useVideoSettings();

  return (
    <SettingsEntry
      interactiveComponent={
        <Switch
          isChecked={settings.showLargePlayerCount}
          onChange={async (isChecked) => {
            await updateSettings({ showLargePlayerCount: isChecked });
          }}
        />
      }
      description={
        <p>
          <Trans>Show remaining players as numbers instead of avatars (CS2: Large player count).</Trans>
        </p>
      }
      title={<Trans context="Settings title">Large player count</Trans>}
    />
  );
}
