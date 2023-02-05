import { useEffect, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { useStateArray } from './utils/useStateArray';
import { useValidatedForm } from './utils/useValidatedForm';
import { claimFees } from './treasury/claimFees';
import { SupportedChainId } from './treasury/SupportedChainId';
import { setAsyncCallback } from './utils/setAsyncCallback';
import { URLParams } from './utils/URLParams';

export default function ClaimFees({
  chainId,
  onError = console.error,
}: {
  chainId: SupportedChainId,
  onError?: (error: unknown) => void;
}) {

  const [ orderbooks, changeOrderbook, insertOrderbook, removeOrderbook ] = useStateArray(decodeOrderbooks(URLParams.orderbooks));

  const [ send, setSend ] = useState(() => () => {});
  const [ sending, setSending ] = useState(false);

  useEffect(() => {
    Object.assign(URLParams, {
      orderbooks: encodeOrderbooks(orderbooks),
    });
  }, [ orderbooks ]);

  // send()
  useEffect(() => setAsyncCallback(setSend, setSending, async (abortSignal) => {
    await claimFees(chainId, orderbooks, abortSignal);
  }, onError), [ chainId, orderbooks, onError ]);

  const [ validated, submit ] = useValidatedForm(send);

  return (
    <Form noValidate validated={validated} onSubmit={submit}>

      <Form.Group className="mb-3">
        <Form.Label>Orderbooks</Form.Label>
        {orderbooks.map((orderbook, index) =>
          <InputGroup key={index} className="mb-2" hasValidation>
            <Form.Control
              className="bg-body border-secondary text-body"
              type="text"
              required
              pattern="0x[0-9a-fA-F]{40}"
              value={orderbook}
              onChange={({target:{value}}) => changeOrderbook(index, value)}
              readOnly={sending}
            />
            <Button
              variant="outline-primary"
              className="px-4 border-secondary text-uppercase"
              onClick={() => orderbooks.length > 1 ? removeOrderbook(index) : changeOrderbook(0, '')}
              disabled={sending}
            >-</Button>
            <Button
              variant="outline-primary"
              className="px-4 border-secondary text-uppercase"
              onClick={() => insertOrderbook(index, '')}
              disabled={sending}
            >+</Button>
            <Form.Control.Feedback type="invalid">
              Please enter a valid address
            </Form.Control.Feedback>
          </InputGroup>
        )}
        <InputGroup className="mb-2">
          <Button
            variant="outline-primary"
            className="border-secondary text-uppercase w-100"
            onClick={() => insertOrderbook(orderbooks.length, '')}
            disabled={sending}
          >+</Button>
        </InputGroup>
      </Form.Group>

      <Form.Group className="text-center">
        <Button
          variant="success"
          className="px-5 text-uppercase fs-5"
          type="submit"
          disabled={sending}
        >{ sending ? 'Sending...' : 'Send' }</Button>
      </Form.Group>

    </Form>
  );
}

function encodeOrderbooks(orderbooks: string[]): string {
  return orderbooks.map(encodeURIComponent).join(',');
}

function decodeOrderbooks(encoded: string): string[] {
  return encoded.split(',').map(decodeURIComponent);
}
