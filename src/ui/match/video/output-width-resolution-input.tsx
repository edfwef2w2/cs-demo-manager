import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { InputNumber } from 'csdm/ui/components/inputs/number-input';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';

export function OutputWidthResolutionInput() {
  const { t } = useLingui();
  const { settings, updateSettings } = useVideoSettings();

  const displayedWidth = settings.outputWidth || settings.width;

  const onBlur = async (event: React.FocusEvent<HTMLInputElement>) => {
    let newWidth = Number(event.target.value);
    if (Number.isNaN(newWidth) || newWidth <= 0 || newWidth === settings.width) {
      newWidth = 0;
    }

    await updateSettings({
      outputWidth: newWidth,
    });
  };

  return (
    <InputNumber
      key={`${settings.outputWidth}-${settings.width}`}
      label={<Trans context="Input label">Output width</Trans>}
      onBlur={onBlur}
      defaultValue={displayedWidth}
      min={0}
      placeholder={t({
        context: 'Input placeholder',
        message: 'Same as width',
      })}
    />
  );
}
