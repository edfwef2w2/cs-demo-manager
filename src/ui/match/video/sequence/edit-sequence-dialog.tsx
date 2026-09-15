import React from 'react';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import type { Sequence } from 'csdm/common/types/sequence';
import { SequenceDialog } from './sequence-dialog';
import { updateSequence } from '../sequences/sequences-actions';
import type { SequenceForm } from './sequence-form';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';

type Props = {
  sequence: Sequence;
  closeDialog: () => void;
};

export function EditSequenceDialog({ closeDialog, sequence }: Props) {
  const dispatch = useDispatch();
  const match = useCurrentMatch();
  const { settings } = useVideoSettings();

  const onSaveClick = (sequenceForm: SequenceForm) => {
    const updatedSequence: Sequence = {
      ...sequenceForm,
      number: Number(sequenceForm.number),
      startTick: Number(sequenceForm.startTick),
      endTick: Number(sequenceForm.endTick),
      showXRay: settings.mirvPov ? false : sequenceForm.showXRay,
      showLargePlayerCount: sequenceForm.showLargePlayerCount ?? false,
    };
    dispatch(
      updateSequence({
        demoFilePath: match.demoFilePath,
        sequence: updatedSequence,
        previousNumber: sequence.number,
      }),
    );
  };

  return (
    <SequenceDialog
      initialSequence={sequence}
      isVisible={sequence !== undefined}
      closeDialog={closeDialog}
      onSaveClick={onSaveClick}
    />
  );
}
