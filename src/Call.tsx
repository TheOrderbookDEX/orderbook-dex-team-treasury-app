import { useEffect, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { useStateArray } from './utils/useStateArray';
import { useValidatedForm } from './utils/useValidatedForm';
import { parseValue } from '@frugalwizard/abi2ts-lib';
import { setAsyncCallback } from './utils/setAsyncCallback';
import { SupportedChainId } from './treasury/SupportedChainId';
import { getNonce } from './treasury/getNonce';
import { signCall } from './treasury/signCall';
import { call } from './treasury/call';
import { URLParams } from './utils/URLParams';

enum Action {
  SEND = 'send',
  SIGN = 'sign',
}

export default function Call({
  chainId,
  onError = console.error,
}: {
  chainId: SupportedChainId,
  onError?: (error: unknown) => void;
}) {

  const [ action, setAction ] = useState(URLParams.action || Action.SEND);
  const [ target, setTarget ] = useState(URLParams.target);
  const [ method, setMethod ] = useState(URLParams.method);
  const [ args, changeArg, insertArg, removeArg ] = useStateArray<[ type: string, value: string ]>(decodeArgs(URLParams.args));
  const [ value, setValue ] = useState(URLParams.value);
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
      target,
      method,
      args: encodeArgs(args),
      value,
      deadline,
      signatures: encodeSignatures(signatures),
      executor,
      nonce,
    });
  }, [ action, target, method, args, value, deadline, signatures, executor, nonce ]);

  // refreshNonce()
  useEffect(() => setAsyncCallback(setRefreshNonce, setRefreshingNonce, async (abortSignal) => {
    setNonce('');
    setNonce(String(await getNonce(chainId, abortSignal)));
  }, onError), [ chainId, onError ]);

  // sign()
  useEffect(() => setAsyncCallback(setSign, setSending, async (abortSignal) => {
    setSignature('');
    setSignature(await signCall(
      chainId,
      executor,
      BigInt(nonce),
      target,
      method,
      args,
      parseValue(value || '0'),
      BigInt(new Date(`${deadline}Z`).getTime() / 1000),
      abortSignal
    ));
  }, onError), [ args, chainId, deadline, executor, method, nonce, onError, target, value ]);

  // send()
  useEffect(() => setAsyncCallback(setSend, setSending, async (abortSignal) => {
    await call(
      chainId,
      target,
      method,
      args,
      parseValue(value || '0'),
      BigInt(new Date(`${deadline}Z`).getTime() / 1000),
      signatures,
      abortSignal
    );
  }, onError), [ args, chainId, deadline, method, onError, signatures, target, value ]);

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
        <Form.Label className="fw-bold">Contract Address</Form.Label>
        <Form.Control
          className="bg-body border-secondary text-body"
          type="text"
          required
          pattern="0x[0-9a-fA-F]{40}"
          value={target}
          onChange={({target:{value}}) => setTarget(value)}
          readOnly={sending}
        />
        <Form.Control.Feedback type="invalid">
          Please enter a valid address
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="fw-bold">Function Name</Form.Label>
        <Form.Control
          className="bg-body border-secondary text-body"
          type="text"
          required
          value={method}
          onChange={({target:{value}}) => setMethod(value)}
          readOnly={sending}
        />
        <Form.Control.Feedback type="invalid">
          Please enter the function name
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="fw-bold">Args</Form.Label>
        {args.map(([ type, value ], index) =>
          <InputGroup key={index} className="mb-2" hasValidation>
            <Form.Control
              placeholder="type"
              className="bg-body border-secondary text-body"
              type="text"
              required
              value={type}
              onChange={({target:{value: type}}) => changeArg(index, [type, value])}
              readOnly={sending}
            />
            <Form.Control
              placeholder="value"
              className="bg-body border-secondary text-body w-50"
              type="text"
              required
              value={value}
              onChange={({target:{value}}) => changeArg(index, [type, value])}
              readOnly={sending}
            />
            <Button
              variant="outline-primary"
              className="px-4 border-secondary text-uppercase"
              onClick={() => removeArg(index)}
              disabled={sending}
            >-</Button>
            <Button
              variant="outline-primary"
              className="px-4 border-secondary text-uppercase"
              onClick={() => insertArg(index, ['', ''])}
              disabled={sending}
            >+</Button>
            <Form.Control.Feedback type="invalid">
              Please enter a type and value
            </Form.Control.Feedback>
          </InputGroup>
        )}
        <InputGroup className="mb-2">
          <Button
            variant="outline-primary"
            className="border-secondary text-uppercase w-100"
            onClick={() => insertArg(args.length, ['', ''])}
            disabled={sending}
          >+</Button>
        </InputGroup>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="fw-bold">ETH Value</Form.Label>
        <Form.Control
          className="bg-body border-secondary text-body"
          type="text"
          pattern="[0-9]+(\.[0-9]+)?"
          value={value}
          onChange={({target:{value}}) => setValue(value)}
          readOnly={sending}
        />
        <Form.Control.Feedback type="invalid">
          Please enter a valid ETH value
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

function encodeArg(arg: [ type: string, value: string ]): string {
  return arg.map(encodeURIComponent).join(' ');
}

function decodeArg(encoded: string): [ type: string, value: string ] {
  const [ type, value ] = encoded.split(' ').map(decodeURIComponent);
  return [ type ?? '', value ?? '' ];
}

function encodeArgs(args: [ type: string, value: string ][]): string {
  return args.map(encodeArg).join(',');
}

function decodeArgs(encoded: string): [ type: string, value: string ][] {
  return encoded ? encoded.split(',').map(decodeArg) : [];
}

function encodeSignatures(signatures: string[]): string {
  return signatures.map(encodeURIComponent).join(',');
}

function decodeSignatures(encoded: string): string[] {
  return encoded ? encoded.split(',').map(decodeURIComponent) : [];
}
