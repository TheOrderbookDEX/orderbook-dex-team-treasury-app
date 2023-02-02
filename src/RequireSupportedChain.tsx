import { useEffect, useState, ReactNode } from 'react';
import { Spinner } from 'react-bootstrap';
import { getChainId } from './ethereum';
import { SupportedChainId } from './treasury/SupportedChainId';
import { asyncEffect } from './utils/asyncEffect';

export default function RequireSupportedChain({
  onError = console.error,
  children,
}: {
  onError?: (error: unknown) => void;
  children: (chainId: number) => ReactNode;
}) {

  const [ loading, setLoading ] = useState(true);
  const [ chainId, setChainId ] = useState(0);

  useEffect(() => asyncEffect(setLoading, async (abortSignal) => {
    setChainId(0);
    const chainId = await getChainId(abortSignal);
    if (chainId in SupportedChainId) {
      setChainId(chainId);
    }
  }, onError), [ onError ]);

  return (
    <>
      { chainId ?
        children(chainId)

      : loading ?
        <fieldset className="border border-primary p-3">
          <legend className="float-none w-auto m-0">Checking current chain...</legend>

          <Spinner animation="border" />
        </fieldset>

      :
        <fieldset className="border border-primary p-3">
          <legend className="float-none w-auto m-0">Unsupported chain</legend>

          <div>The current chain is not supported.</div>
        </fieldset>
      }
    </>
  );
}
