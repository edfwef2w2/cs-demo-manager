import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { InputNumber } from 'csdm/ui/components/inputs/number-input';

export function RecordingOutputWidth() {
  const { t } = useLingui();
  const { settings, updateSettings } = useVideoSettings();

  return (
    <SettingsEntry
      interactiveComponent={
        <InputNumber
          key={`${settings.outputWidth}-${settings.width}`}
          onBlur={async (event) => {
            let outputWidth = Number.parseInt(event.target.value);
            if (Number.isNaN(outputWidth) || outputWidth <= 0 || outputWidth === settings.width) {
              outputWidth = 0;
            }
            await updateSettings({ outputWidth });
          }}
          placeholder={t({
            context: 'Input placeholder',
            message: 'Same as width',
          })}
          defaultValue={settings.outputWidth || settings.width}
          min={0}
        />
      }
      description={<Trans>Output video width. 0 keeps the game recording width.</Trans>}
      title={<Trans context="Settings title">Output width</Trans>}
    />
  );
}
