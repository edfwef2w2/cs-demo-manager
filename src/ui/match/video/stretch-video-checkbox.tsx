import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Checkbox } from 'csdm/ui/components/inputs/checkbox';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';

export function StretchVideoCheckbox() {
  const { settings, updateSettings } = useVideoSettings();

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await updateSettings({
      stretchVideo: event.target.checked,
    });
  };

  return (
    <Checkbox
      label={<Trans context="Checkbox label">Stretch game footage to output resolution</Trans>}
      isChecked={settings.stretchVideo}
      onChange={onChange}
    />
  );
}
