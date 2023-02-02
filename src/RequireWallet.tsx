import { useEffect, useState, ReactNode } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { getAccount, requestAccount } from './ethereum';
import { asyncEffect } from './utils/asyncEffect';
import { setAsyncCallback } from './utils/setAsyncCallback';

export default function RequireWallet({
  onError = console.error,
  children,
}: {
  onError?: (error: unknown) => void;
  children: (account: string) => ReactNode;
}) {

  const [ account, setAccount ] = useState('');
  const [ connecting, setConnecting ] = useState(true);
  const [ connect, setConnect ] = useState(() => () => {});

  useEffect(() => asyncEffect(setConnecting, async (abortSignal) => {
    setAccount('');
    const account = await getAccount(abortSignal);
    setAccount(account);
  }, onError), [ onError ]);

  // connect()
  useEffect(() => setAsyncCallback(setConnect, setConnecting, async (abortSignal) => {
    setAccount('');
    setAccount(await requestAccount(abortSignal));
  }, onError), [ onError ]);

  return (
    <>
      { account ?
        children(account)

      :
        <fieldset className="border border-primary p-3">
          <legend className="float-none w-auto m-0">Connect to wallet</legend>

          <div className="text-center">
            <Button
              className="text-uppercase"
              variant="success"
              disabled={connecting}
              onClick={connect}
            >
              { connecting ?
                <><Spinner animation="border" size="sm" /> Connecting...</>

              :
                <>Connect</>
              }
            </Button>
          </div>
        </fieldset>
      }
    </>
  );
}
