import { Address, digestTypedData, encodeCall } from '@frugal-wizard/abi2ts-lib';
import { IOrderbookDEXTeamTreasury } from '@theorderbookdex/orderbook-dex-team-treasury/dist/interfaces/IOrderbookDEXTeamTreasury';
import { getAccount } from '../ethereum';
import { getNonce } from './getNonce';
import { sortSignatures } from './sortSignatures';
import { SupportedChainId } from './SupportedChainId';
import { treasuryAddress } from './treasuryAddress';

export async function call(
  chainId:      SupportedChainId,
  target:       Address,
  method:       string,
  args:         [ type: string, value: string ][],
  value:        bigint,
  deadline:     bigint,
  signatures:   string[],
  abortSignal?: AbortSignal
): Promise<void> {
  const data = encodeCall(method, args.map(([ type ]) => type), args.map(([ , value ]) => value));

  const executor = await getAccount(abortSignal);
  const nonce = await getNonce(chainId, abortSignal);

  const digest = digestTypedData({
    name: 'OrderbookDEXTeamTreasury',
    version: '1',
    chainId,
    verifyingContract: treasuryAddress[chainId],
  }, {
    Call: [
      { name: 'executor', type: 'address' },
      { name: 'nonce',    type: 'uint256' },
      { name: 'target',   type: 'address' },
      { name: 'data',     type: 'bytes'   },
      { name: 'value',    type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  }, {
    executor: executor,
    nonce:    String(nonce),
    target:   target,
    data:     data,
    value:    String(value),
    deadline: String(deadline),
  });

  const sortedSignatures = sortSignatures(digest, signatures);

  try {
    const treasury = IOrderbookDEXTeamTreasury.at(treasuryAddress[chainId]);
    await treasury.callStatic.call(target, data, value, deadline, sortedSignatures);
    await treasury.sendTransaction.call(target, data, value, deadline, sortedSignatures);

  } finally {
    if (abortSignal?.aborted) throw abortSignal.reason;
  }
}
