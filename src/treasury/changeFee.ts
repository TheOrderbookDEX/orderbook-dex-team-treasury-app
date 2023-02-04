import { digestTypedData } from '@frugal-wizard/abi2ts-lib';
import { IOrderbookDEXTeamTreasury } from '@theorderbookdex/orderbook-dex-team-treasury/dist/interfaces/IOrderbookDEXTeamTreasury';
import { getAccount } from '../ethereum';
import { getNonce } from './getNonce';
import { sortSignatures } from './sortSignatures';
import { SupportedChainId } from './SupportedChainId';
import { treasuryAddress } from './treasuryAddress';

export async function changeFee(
  chainId:      SupportedChainId,
  version:      bigint,
  fee:          bigint,
  deadline:     bigint,
  signatures:   string[],
  abortSignal?: AbortSignal
): Promise<void> {
  const executor = await getAccount(abortSignal);
  const nonce = await getNonce(chainId, abortSignal);

  const digest = digestTypedData({
    name: 'OrderbookDEXTeamTreasury',
    version: '1',
    chainId,
    verifyingContract: treasuryAddress[chainId],
  }, {
      ChangeFee: [
        { name: 'executor', type: 'address' },
        { name: 'nonce',    type: 'uint256' },
        { name: 'version',  type: 'uint32' },
        { name: 'fee',      type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
  }, {
    executor: executor,
    nonce:    String(nonce),
    version:  String(version),
    fee:      String(fee),
    deadline: String(deadline),
  });

  const sortedSignatures = sortSignatures(digest, signatures);

  try {
    const treasury = IOrderbookDEXTeamTreasury.at(treasuryAddress[chainId]);
    await treasury.callStatic.changeFee(version, fee, deadline, sortedSignatures);
    await treasury.sendTransaction.changeFee(version, fee, deadline, sortedSignatures);

  } finally {
    if (abortSignal?.aborted) throw abortSignal.reason;
  }
}
