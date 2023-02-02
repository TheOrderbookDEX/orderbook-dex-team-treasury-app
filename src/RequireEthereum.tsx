import { useEffect, useState, ReactNode } from 'react';
import { getEthereum } from './ethereum';

export default function RequireEthereum({
  onError = console.error,
  children,
}: {
  onError?: (error: unknown) => void;
  children: ReactNode;
}) {

  const [ connected, setConnected ] = useState(false);

  useEffect(() => {
    setConnected(false);

    try {
      const ethereum = getEthereum();
      if (!ethereum) return;
      const onChange = () => window.location.reload();
      ethereum.on('chainChanged', onChange);
      ethereum.on('accountsChanged', onChange);
      setConnected(true);

      return () => {
        ethereum.removeListener('chainChanged', onChange);
        ethereum.removeListener('accountsChanged', onChange);
      };

    } catch (error) {
      onError(error);
    }
  }, [ onError ]);

  return (
    <>
      { connected ?
        children

      :
        <fieldset className="border border-primary p-3">
          <legend className="float-none w-auto m-0">Ethereum Provider</legend>

          <div className="text-center">No ethereum provider found</div>
        </fieldset>
      }
    </>
  );
}
