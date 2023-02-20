import { Address, encodeCall } from '@frugalwizard/abi2ts-lib';
import { signTypedData } from '../ethereum';
import { SupportedChainId } from './SupportedChainId';
import { treasuryAddress } from './treasuryAddress';

export async function signCall(
  chainId:      SupportedChainId,
  executor:     Address,
  nonce:        bigint,
  target:       Address,
  method:       string,
  args:         [ type: string, value: string ][],
  value:        bigint,
  deadline:     bigint,
  abortSignal?: AbortSignal
): Promise<string> {
  const data = encodeCall(method, args.map(([ type ]) => type), args.map(([ , value ]) => value));

  return await signTypedData({
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' }
      ],
      Call: [
        { name: 'executor', type: 'address' },
        { name: 'nonce', type: 'uint256' },
        { name: 'target', type: 'address' },
        { name: 'data', type: 'bytes' },
        { name: 'value', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    },
    domain: {
      name: 'OrderbookDEXTeamTreasury',
      version: '1',
      chainId,
      verifyingContract: treasuryAddress[chainId],
    },
    primaryType: 'Call',
    message: {
      executor: executor,
      nonce:    String(nonce),
      target:   target,
      data:     data,
      value:    String(value),
      deadline: String(deadline),
    },
  }, abortSignal);
}
