import React, { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { useIsHlaeInstalled } from 'csdm/ui/match/video/hlae/use-is-hlae-installed';
import { UninstallButton } from 'csdm/ui/components/buttons/uninstall-button';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { uninstallHlaeSuccess } from './hlae-actions';
import { useHlaeSettings } from 'csdm/ui/settings/video/hlae/use-hlae-settings';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { ConfirmDialog } from 'csdm/ui/dialogs/confirm-dialog';
import { ButtonVariant } from 'csdm/ui/components/buttons/button';

export function HlaeUninstallButton() {
  const client = useWebSocketClient();
  const showToast = useShowToast();
  const dispatch = useDispatch();
  const { showDialog } = useDialog();
  const isHlaeInstalled = useIsHlaeInstalled();
  const [isUninstalling, setIsUninstalling] = useState(false);
  const { hlaeSettings } = useHlaeSettings();
  const isDisabled = !isHlaeInstalled || isUninstalling || hlaeSettings.customLocationEnabled;

  const uninstall = async () => {
    try {
      showToast({
        content: <Trans>Uninstalling HLAE…</Trans>,
        id: 'hlae-uninstallation',
      });
      setIsUninstalling(true);
      await client.send({
        name: RendererClientMessageName.UninstallHlae,
      });
      dispatch(uninstallHlaeSuccess());
      showToast({
        content: <Trans>HLAE has been uninstalled</Trans>,
        id: 'hlae-uninstallation',
        type: 'success',
      });
    } catch (error) {
      showToast({
        content: <Trans>An error occurred while uninstalling HLAE</Trans>,
        id: 'hlae-uninstallation',
        type: 'error',
      });
    } finally {
      setIsUninstalling(false);
    }
  };

  const onClick = () => {
    showDialog(
      <ConfirmDialog
        title={<Trans>Uninstall HLAE</Trans>}
        onConfirm={uninstall}
        confirmButtonVariant={ButtonVariant.Danger}
      >
        <p>
          <Trans>HLAE will be removed from the application folder. You can install it again later.</Trans>
        </p>
      </ConfirmDialog>,
    );
  };

  return <UninstallButton isDisabled={isDisabled} isUninstalling={isUninstalling} onClick={onClick} />;
}
