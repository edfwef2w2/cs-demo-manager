import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { InputNumber } from 'csdm/ui/components/inputs/number-input';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';

export function OutputHeightResolutionInput() {
  const { t } = useLingui();
  const { settings, updateSettings } = useVideoSettings();

  const displayedHeight = settings.outputHeight || settings.height;

  const onBlur = async (event: React.FocusEvent<HTMLInputElement>) => {
    let newHeight = Number(event.target.value);
    if (Number.isNaN(newHeight) || newHeight <= 0 || newHeight === settings.height) {
      newHeight = 0;
    }

    await updateSettings({
      outputHeight: newHeight,
    });
  };

  return (
    <InputNumber
      key={`${settings.outputHeight}-${settings.height}`}
      label={<Trans context="Input label">Output height</Trans>}
      onBlur={onBlur}
      defaultValue={displayedHeight}
      min={0}
      placeholder={t({
        context: 'Input placeholder',
        message: 'Same as height',
      })}
    />
  );
}
