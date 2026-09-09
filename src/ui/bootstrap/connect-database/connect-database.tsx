import React, { useState, useCallback } from 'react';
import { Trans } from '@lingui/react/macro';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { ConnectDatabaseButton } from 'csdm/ui/bootstrap/connect-database/connect-database-button';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { AppWrapper } from '../app-wrapper';
import { AppContent } from '../app-content';
import { connectDatabaseError, connectDatabaseSuccess } from '../bootstrap-actions';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useBootstrapState } from '../use-bootstrap-state';
import type { ConnectDatabaseError } from 'csdm/server/handlers/renderer-process/database/connect-database-handler';
import { ErrorCode } from 'csdm/common/error-code';
import { ErrorMessage } from 'csdm/ui/components/error-message';
import { ButtonVariant } from 'csdm/ui/components/buttons/button';
import { ResetDatabaseButton } from 'csdm/ui/settings/database/reset-database-button';

function DatabaseSchemaVersionMismatch() {
  return (
    <div>
      <p>
        <Trans>
          It looks like you installed an older version of CS Demo Manager and the current database schema is not
          compatible with it.
        </Trans>
      </p>
      <p>
        <Trans>
          You can either update CS Demo Manager to the latest version or reset the database to start from scratch.
        </Trans>
      </p>

      <div className="mt-8">
        <ResetDatabaseButton variant={ButtonVariant.Danger} />
      </div>
    </div>
  );
}

function getHintFromError({ code }: ConnectDatabaseError) {
  if (code === ErrorCode.DatabaseSchemaVersionMismatch) {
    return <DatabaseSchemaVersionMismatch />;
  }

  return (
    <p>
      <Trans>Make sure the application can write to its data folder.</Trans>
    </p>
  );
}

export function ConnectDatabase() {
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const { error } = useBootstrapState();
  const [isConnecting, setIsConnecting] = useState(false);

  const connectDatabase = useCallback(async () => {
    setIsConnecting(true);
    const result = await client.send({
      name: RendererClientMessageName.ConnectDatabase,
    });
    if (result) {
      setIsConnecting(false);
      dispatch(connectDatabaseError({ error: result }));
    } else {
      dispatch(connectDatabaseSuccess());
    }
  }, [client, dispatch]);

  return (
    <AppWrapper>
      <AppContent>
        <div className="m-auto flex max-w-[600px] flex-col">
          <p>
            <Trans>CS Demo Manager could not open the local data store.</Trans>
          </p>
          <div className="mt-12">
            <ConnectDatabaseButton isLoading={isConnecting} onClick={connectDatabase} />
          </div>
          {error ? (
            <div className="mt-8 flex flex-col">
              <ErrorMessage message={<Trans>Opening the data store failed with the following error:</Trans>} />
              <p className="my-8 text-body-strong select-text">{error.message}</p>
              {getHintFromError(error)}
            </div>
          ) : null}
        </div>
      </AppContent>
    </AppWrapper>
  );
}
