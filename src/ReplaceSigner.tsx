import { useEffect, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { useStateArray } from './utils/useStateArray';
import { useValidatedForm } from './utils/useValidatedForm';
import { setAsyncCallback } from './utils/setAsyncCallback';
import { SupportedChainId } from './treasury/SupportedChainId';
import { getNonce } from './treasury/getNonce';
import { URLParams } from './utils/URLParams';
import { signReplaceSigner } from './treasury/signReplaceSigner';
import { replaceSigner } from './treasury/replaceSigner';

enum Action {
  SEND = 'send',
  SIGN = 'sign',
}

export default function ReplaceSigner({
  chainId,
  onError = console.error,
}: {
  chainId: SupportedChainId,
  onError?: (error: unknown) => void;
}) {

  const [ action, setAction ] = useState(URLParams.action || Action.SEND);
  const [ signerToRemove, setSignerToRemove ] = useState(URLParams.signerToRemove);
  const [ signerToAdd, setSignerToAdd ] = useState(URLParams.signerToAdd);
  const [ deadline, setDeadline ] = useState(URLParams.deadline);

  const [ signatures, changeSig, insertSig, removeSig ] = useStateArray<string>(decodeSignatures(URLParams.signatures));

  const [ executor, setExecutor ] = useState(URLParams.executor);
  const [ nonce, setNonce ] = useState(URLParams.nonce);
  const [ refreshNonce, setRefreshNonce ] = useState(() => () => {});
  const [ refreshingNonce, setRefreshingNonce ] = useState(false);
  const [ signature, setSignature ] = useState('');

  const [ sign, setSign ] = useState(() => () => {});
  const [ send, setSend ] = useState(() => () => {});
  const [ sending, setSending ] = useState(false);

  useEffect(() => {
    Object.assign(URLParams, {
      action,
      signerToRemove,
      signerToAdd,
      deadline,
      signatures: encodeSignatures(signatures),
      executor,
      nonce,
    });
  }, [ action, signerToRemove, signerToAdd, deadline, signatures, executor, nonce ]);

  // refreshNonce()
  useEffect(() => setAsyncCallback(setRefreshNonce, setRefreshingNonce, async (abortSignal) => {
    setNonce('');
    setNonce(String(await getNonce(chainId, abortSignal)));
  }, onError), [ chainId, onError ]);

  // sign()
  useEffect(() => setAsyncCallback(setSign, setSending, async (abortSignal) => {
    setSignature('');
    setSignature(await signReplaceSigner(
      chainId,
      executor,
      BigInt(nonce),
      signerToRemove,
      signerToAdd,
      BigInt(new Date(`${deadline}Z`).getTime() / 1000),
      abortSignal
    ));
  }, onError), [ chainId, deadline, executor, nonce, onError, signerToAdd, signerToRemove ]);

  // send()
  useEffect(() => setAsyncCallback(setSend, setSending, async (abortSignal) => {
    await replaceSigner(
      chainId,
      signerToRemove,
      signerToAdd,
      BigInt(new Date(`${deadline}Z`).getTime() / 1000),
      signatures,
      abortSignal
    );
  }, onError), [ chainId, deadline, onError, signatures, signerToAdd, signerToRemove ]);

  const [ validated, submit ] = useValidatedForm({ send, sign }[action] ?? (() => {}));

  return (
    <Form noValidate validated={validated} onSubmit={submit}>

      <InputGroup className="mb-3">
        <Button
          size='sm'
          variant="outline-primary"
          className="px-4 border-secondary text-uppercase"
          active={action === Action.SEND}
          onClick={() => setAction(Action.SEND)}
        >Send</Button>
        <Button
          size='sm'
          variant="outline-primary"
          className="px-4 border-secondary text-uppercase"
          active={action === Action.SIGN}
          onClick={() => setAction(Action.SIGN)}
        >Sign</Button>
      </InputGroup>

      { action === Action.SIGN && <>

        <Form.Group className="mb-3">
          <Form.Label className="fw-bold">Executor Address</Form.Label>
          <Form.Control
            className="bg-body border-secondary text-body"
            type="text"
            required
            pattern="0x[0-9a-fA-F]{40}"
            value={executor}
            onChange={({target:{value}}) => setExecutor(value)}
            readOnly={sending}
          />
          <Form.Control.Feedback type="invalid">
            Please enter a valid address
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-bold">Nonce</Form.Label>
          <InputGroup hasValidation>
            <Form.Control
              className="bg-body border-secondary text-body"
              type="text"
              required
              pattern="[0-9]+"
              value={nonce}
              onChange={({target:{value}}) => setNonce(value)}
              readOnly={refreshingNonce || sending}
            />
            <Button
              variant="outline-primary"
              className="px-4 border-secondary text-uppercase"
              onClick={refreshNonce}
              disabled={refreshingNonce || sending}
            >⟳</Button>
            <Form.Control.Feedback type="invalid">
              Please enter a valid nonce number
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>

      </>}

      <Form.Group className="mb-3">
        <Form.Label className="fw-bold">Signer to Remove</Form.Label>
        <Form.Control
          className="bg-body border-secondary text-body"
          type="text"
          required
          pattern="0x[0-9a-fA-F]{40}"
          value={signerToRemove}
          onChange={({target:{value}}) => setSignerToRemove(value)}
          readOnly={sending}
        />
        <Form.Control.Feedback type="invalid">
          Please enter a valid address
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="fw-bold">Signer to Add</Form.Label>
        <Form.Control
          className="bg-body border-secondary text-body"
          type="text"
          required
          pattern="0x[0-9a-fA-F]{40}"
          value={signerToAdd}
          onChange={({target:{value}}) => setSignerToAdd(value)}
          readOnly={sending}
        />
        <Form.Control.Feedback type="invalid">
          Please enter a valid address
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="fw-bold">Deadline</Form.Label>
        <InputGroup className="mb-2" hasValidation>
          <InputGroup.Text className="bg-body border-secondary text-body">UTC</InputGroup.Text>
          <Form.Control
            className="bg-body border-secondary text-body"
            type="datetime-local"
            required
            step={1}
            value={deadline}
            onChange={({target:{value}}) => setDeadline(value)}
            readOnly={sending}
          />
          <InputGroup.Text className="bg-body border-secondary text-body">ISO</InputGroup.Text>
          <Form.Control
            className="bg-body border-secondary text-body"
            type="text"
            required
            value={deadline}
            onChange={({target:{value}}) => setDeadline(value)}
            readOnly={sending}
          />
          <Form.Control.Feedback type="invalid">
            Please select the deadline
          </Form.Control.Feedback>
        </InputGroup>
        <InputGroup>
          <InputGroup.Text className="bg-body border-secondary text-body">Local Time</InputGroup.Text>
          <Form.Control
            className="bg-body border-secondary text-body"
            type="text"
            value={deadline && new Date(`${deadline}Z`).toString()}
            readOnly={true}
          />
        </InputGroup>
      </Form.Group>

      { action === Action.SEND && <>

        <Form.Group className="mb-3">
          <Form.Label className="fw-bold">Signatures</Form.Label>
          {signatures.map((signature, index) =>
            <InputGroup key={index} className="mb-2" hasValidation>
              <Form.Control
                className="bg-body border-secondary text-body"
                type="text"
                required
                pattern="0x[0-9a-fA-F]{130}"
                value={signature}
                onChange={({target:{value}}) => changeSig(index, value)}
                readOnly={sending}
              />
              <Button
                variant="outline-primary"
                className="px-4 border-secondary text-uppercase"
                onClick={() => removeSig(index)}
                disabled={sending}
              >-</Button>
              <Button
                variant="outline-primary"
                className="px-4 border-secondary text-uppercase"
                onClick={() => insertSig(index, '')}
                disabled={sending}
              >+</Button>
              <Form.Control.Feedback type="invalid">
                Please enter a valid signature
              </Form.Control.Feedback>
            </InputGroup>
          )}
          <InputGroup className="mb-2">
            <Button
              variant="outline-primary"
              className="border-secondary text-uppercase w-100"
              onClick={() => insertSig(signatures.length, '')}
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

      </>}

      { action === Action.SIGN && <>

        <hr />

        <Form.Group className="mb-3">
          <Form.Label className="fw-bold">Signature</Form.Label>
          <Form.Control
            as="textarea"
            className="bg-body border-secondary text-body"
            value={signature}
            readOnly
          />
        </Form.Group>

        <Form.Group className="text-center">
          <Button
            variant="success"
            className="px-5 text-uppercase fs-5"
            type="submit"
            disabled={sending}
          >{ sending ? 'Signing...' : 'Sign' }</Button>
        </Form.Group>

      </>}

    </Form>
  );
}

function encodeSignatures(signatures: string[]): string {
  return signatures.map(encodeURIComponent).join(',');
}

function decodeSignatures(encoded: string): string[] {
  return encoded ? encoded.split(',').map(decodeURIComponent) : [];
}
