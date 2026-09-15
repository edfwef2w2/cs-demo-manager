import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { InputNumber } from 'csdm/ui/components/inputs/number-input';

export function RecordingOutputHeight() {
  const { t } = useLingui();
  const { settings, updateSettings } = useVideoSettings();

  return (
    <SettingsEntry
      interactiveComponent={
        <InputNumber
          key={`${settings.outputHeight}-${settings.height}`}
          onBlur={async (event) => {
            let outputHeight = Number.parseInt(event.target.value);
            if (Number.isNaN(outputHeight) || outputHeight <= 0 || outputHeight === settings.height) {
              outputHeight = 0;
            }
            await updateSettings({ outputHeight });
          }}
          placeholder={t({
            context: 'Input placeholder',
            message: 'Same as height',
          })}
          defaultValue={settings.outputHeight || settings.height}
          min={0}
        />
      }
      description={<Trans>Output video height. 0 keeps the game recording height.</Trans>}
      title={<Trans context="Settings title">Output height</Trans>}
    />
  );
}
