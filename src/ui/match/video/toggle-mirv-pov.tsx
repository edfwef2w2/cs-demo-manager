import React, { useEffect } from 'react';
import { Trans } from '@lingui/react/macro';
import { Checkbox } from 'csdm/ui/components/inputs/checkbox';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { ExclamationTriangleIcon } from 'csdm/ui/icons/exclamation-triangle-icon';
import { RecordingSystem } from 'csdm/common/types/recording-system';
import { useIsHlaeInstalled } from 'csdm/ui/match/video/hlae/use-is-hlae-installed';

export function ToggleMirvPov() {
  const { settings, updateSettings } = useVideoSettings();
  const isHlaeInstalled = useIsHlaeInstalled();
  const canEnable = settings.recordingSystem === RecordingSystem.HLAE && isHlaeInstalled;

  useEffect(() => {
    if (!canEnable && settings.mirvPov) {
      void updateSettings({
        mirvPov: false,
      });
    }
  }, [canEnable, settings.mirvPov, updateSettings]);

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await updateSettings({
      mirvPov: event.target.checked,
    });
  };

  return (
    <div className="flex items-center gap-x-8">
      <Checkbox
        label={<Trans context="Checkbox label">Experimental: first-person player HUD</Trans>}
        onChange={onChange}
        isChecked={canEnable && settings.mirvPov}
        isDisabled={!canEnable}
      />

      <Tooltip
        content={
          <p>
            {isHlaeInstalled ? (
              <Trans>
                Experimental. Shows the playing player HUD during offline CS2 demo recording. Requires HLAE. The game
                starts insecurely and blocks connect commands in-app — do not join VAC servers. Game updates may break
                this feature.
              </Trans>
            ) : (
              <Trans>Install HLAE first to enable this experimental player HUD.</Trans>
            )}
          </p>
        }
      >
        <ExclamationTriangleIcon className="size-12 text-red-400" />
      </Tooltip>
    </div>
  );
}
