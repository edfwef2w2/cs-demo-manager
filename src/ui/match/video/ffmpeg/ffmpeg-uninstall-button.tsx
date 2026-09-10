import React, { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { UninstallButton } from 'csdm/ui/components/buttons/uninstall-button';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useIsFfmpegInstalled } from './use-is-ffmpeg-installed';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useFfmpegSettings } from 'csdm/ui/settings/video/ffmpeg/use-ffmpeg-settings';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { uninstallFfmpegSuccess } from './ffmpeg-actions';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { ConfirmDialog } from 'csdm/ui/dialogs/confirm-dialog';
import { ButtonVariant } from 'csdm/ui/components/buttons/button';

export function FfmpegUninstallButton() {
  const client = useWebSocketClient();
  const showToast = useShowToast();
  const dispatch = useDispatch();
  const { showDialog } = useDialog();
  const isFfmpegInstalled = useIsFfmpegInstalled();
  const [isUninstalling, setIsUninstalling] = useState(false);
  const ffmpegSettings = useFfmpegSettings();
  const isDisabled = !isFfmpegInstalled || isUninstalling || ffmpegSettings.customLocationEnabled;

  const uninstall = async () => {
    try {
      showToast({
        content: <Trans>Uninstalling FFmpeg…</Trans>,
        id: 'ffmpeg-uninstallation',
      });
      setIsUninstalling(true);
      await client.send({
        name: RendererClientMessageName.UninstallFfmpeg,
      });
      dispatch(uninstallFfmpegSuccess());
      showToast({
        content: <Trans>FFmpeg has been uninstalled</Trans>,
        id: 'ffmpeg-uninstallation',
        type: 'success',
      });
    } catch (error) {
      showToast({
        content: <Trans>An error occurred while uninstalling FFmpeg</Trans>,
        id: 'ffmpeg-uninstallation',
        type: 'error',
      });
    } finally {
      setIsUninstalling(false);
    }
  };

  const onClick = () => {
    showDialog(
      <ConfirmDialog
        title={<Trans>Uninstall FFmpeg</Trans>}
        onConfirm={uninstall}
        confirmButtonVariant={ButtonVariant.Danger}
      >
        <p>
          <Trans>FFmpeg will be removed from the application folder. You can install it again later.</Trans>
        </p>
      </ConfirmDialog>,
    );
  };

  return <UninstallButton isDisabled={isDisabled} isUninstalling={isUninstalling} onClick={onClick} />;
}
