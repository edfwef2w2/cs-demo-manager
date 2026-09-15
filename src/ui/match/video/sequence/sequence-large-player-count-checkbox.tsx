import React from 'react';
import { useSequenceForm } from './use-sequence-form';
import { LargePlayerCountCheckbox } from '../large-player-count-checkbox';

export function SequenceLargePlayerCountCheckbox() {
  const { sequence, updateSequence } = useSequenceForm();

  return (
    <LargePlayerCountCheckbox
      defaultChecked={sequence.showLargePlayerCount}
      onChange={(isChecked) => {
        updateSequence({
          showLargePlayerCount: isChecked,
        });
      }}
    />
  );
}
