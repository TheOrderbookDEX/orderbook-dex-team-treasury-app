/* eslint-disable no-restricted-globals */

import { Container, Tab, Tabs } from 'react-bootstrap';
import { useCallback, useEffect, useState } from 'react';
import RequireWallet from './RequireWallet';
import Messages, { useMessages } from './Messages';
import RequireEthereum from './RequireEthereum';
import ClaimFees from './ClaimFees';
import RequireSupportedChain from './RequireSupportedChain';
import Call from './Call';
import { getErrorMessage } from './utils/getErrorMessage';
import { addURLParams, getInitURLParam, removeURLParams } from './utils/URLParams';
import ScheduleChangeFee from './ScheduleChangeFee';
import ChangeFee from './ChangeFee';
import ReplaceSigner from './ReplaceSigner';

// TODO add multicall tab

export default function App() {
  const [ messages, addMessage, removeMessage ] = useMessages();

  const onError = useCallback((error: unknown) => {
    const message = getErrorMessage(error);
    if (/user rejected/i.test(message)) {
      return;
    }
    if (/aborted/.test(message)) {
      return;
    }
    console.error(error);
    addMessage({
      time: Date.now(),
      title: 'Error',
      body: <>{message}</>,
      variant: 'danger',
    });
  }, [ addMessage ]);

  const [ tab, setTab ] = useState(getInitURLParam('tab') || 'claimFees');

  useEffect(() => {
    const params = { tab };
    addURLParams(params);
    return () => removeURLParams(params);
  }, [ tab ]);

  return (
    <>
      <Container fluid="lg" className="my-2">
        <h1>The Orderbook DEX Team Treasury App</h1>
        <hr />

        <RequireEthereum onError={onError}>
          <RequireSupportedChain onError={onError}>{chainId =>
            <RequireWallet onError={onError}>{() =>
              <Tabs activeKey={tab} onSelect={tab => setTab(tab!)} mountOnEnter unmountOnExit>
                <Tab eventKey="claimFees" title="Claim Fees" className="p-3">
                  <ClaimFees chainId={chainId} onError={onError} />
                </Tab>
                <Tab eventKey="call" title="Call" className="p-3">
                  <Call chainId={chainId} onError={onError} />
                </Tab>
                <Tab eventKey="scheduleChangeFee" title="Schedule Change Fee" className="p-3">
                  <ScheduleChangeFee chainId={chainId} onError={onError} />
                </Tab>
                <Tab eventKey="changeFee" title="Change Fee" className="p-3">
                  <ChangeFee chainId={chainId} onError={onError} />
                </Tab>
                <Tab eventKey="replaceSigner" title="Replace Signer" className="p-3">
                  <ReplaceSigner chainId={chainId} onError={onError} />
                </Tab>
              </Tabs>
            }</RequireWallet>
          }</RequireSupportedChain>
        </RequireEthereum>
      </Container>

      <Messages messages={messages} removeMessage={removeMessage} />
    </>
  );
}
