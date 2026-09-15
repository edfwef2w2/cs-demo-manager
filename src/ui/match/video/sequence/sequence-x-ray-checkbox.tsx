import React from 'react';
import { useSequenceForm } from './use-sequence-form';
import { XRayCheckbox } from '../x-ray-checkbox';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';

export function SequenceXRayCheckbox() {
  const { sequence, updateSequence } = useSequenceForm();
  const { settings } = useVideoSettings();
  const isDisabled = settings.mirvPov;

  return (
    <XRayCheckbox
      defaultChecked={isDisabled ? false : sequence.showXRay}
      isDisabled={isDisabled}
      onChange={(isChecked) => {
        updateSequence({
          showXRay: isChecked,
        });
      }}
    />
  );
}
