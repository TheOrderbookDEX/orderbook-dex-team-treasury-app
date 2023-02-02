import { Address } from '@frugal-wizard/abi2ts-lib';
import { signTypedData } from '../ethereum';
import { SupportedChainId } from './SupportedChainId';
import { treasuryAddress } from './treasuryAddress';

export async function signReplaceSigner(
  chainId:        SupportedChainId,
  executor:       Address,
  nonce:          bigint,
  signerToRemove: Address,
  signerToAdd:    Address,
  deadline:       bigint,
  abortSignal?:   AbortSignal
): Promise<string> {
  return await signTypedData({
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' }
      ],
      ReplaceSigner: [
        { name: 'executor',       type: 'address' },
        { name: 'nonce',          type: 'uint256' },
        { name: 'signerToRemove', type: 'address' },
        { name: 'signerToAdd',    type: 'address' },
        { name: 'deadline',       type: 'uint256' },
      ],
    },
    domain: {
      name: 'OrderbookDEXTeamTreasury',
      version: '1',
      chainId,
      verifyingContract: treasuryAddress[chainId],
    },
    primaryType: 'ReplaceSigner',
    message: {
      executor:       executor,
      nonce:          String(nonce),
      signerToRemove: signerToRemove,
      signerToAdd:    signerToAdd,
      deadline:       String(deadline),
    },
  }, abortSignal);
}
