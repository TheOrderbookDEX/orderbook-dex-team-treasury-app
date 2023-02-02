import { Address } from '@frugal-wizard/abi2ts-lib';
import { signTypedData } from '../ethereum';
import { SupportedChainId } from './SupportedChainId';
import { treasuryAddress } from './treasuryAddress';

export async function signScheduleChangeFee(
  chainId:      SupportedChainId,
  executor:     Address,
  nonce:        bigint,
  version:      bigint,
  fee:          bigint,
  deadline:     bigint,
  abortSignal?: AbortSignal
): Promise<string> {
  return await signTypedData({
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' }
      ],
      ScheduleChangeFee: [
        { name: 'executor', type: 'address' },
        { name: 'nonce',    type: 'uint256' },
        { name: 'version',  type: 'uint32' },
        { name: 'fee',      type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    },
    domain: {
      name: 'OrderbookDEXTeamTreasury',
      version: '1',
      chainId,
      verifyingContract: treasuryAddress[chainId],
    },
    primaryType: 'ScheduleChangeFee',
    message: {
      executor: executor,
      nonce:    String(nonce),
      version:  String(version),
      fee:      String(fee),
      deadline: String(deadline),
    },
  }, abortSignal);
}
