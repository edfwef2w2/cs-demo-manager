import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ButtonVariant } from './button';
import { SpinnableButton } from './spinnable-button';

type Props = {
  onClick: () => void;
  isDisabled: boolean;
  isUninstalling: boolean;
};

export function UninstallButton({ onClick, isDisabled, isUninstalling }: Props) {
  return (
    <SpinnableButton
      onClick={onClick}
      isDisabled={isDisabled}
      isLoading={isUninstalling}
      variant={ButtonVariant.Danger}
    >
      <Trans context="Button">Uninstall</Trans>
    </SpinnableButton>
  );
}
