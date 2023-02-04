import { Address, digestTypedData } from '@frugal-wizard/abi2ts-lib';
import { IOrderbookDEXTeamTreasury } from '@theorderbookdex/orderbook-dex-team-treasury/dist/interfaces/IOrderbookDEXTeamTreasury';
import { getAccount } from '../ethereum';
import { getNonce } from './getNonce';
import { sortSignatures } from './sortSignatures';
import { SupportedChainId } from './SupportedChainId';
import { treasuryAddress } from './treasuryAddress';

export async function replaceSigner(
  chainId:        SupportedChainId,
  signerToRemove: Address,
  signerToAdd:    Address,
  deadline:       bigint,
  signatures:     string[],
  abortSignal?:   AbortSignal
): Promise<void> {
  const executor = await getAccount(abortSignal);
  const nonce = await getNonce(chainId, abortSignal);

  const digest = digestTypedData({
    name: 'OrderbookDEXTeamTreasury',
    version: '1',
    chainId,
    verifyingContract: treasuryAddress[chainId],
  }, {
      ReplaceSigner: [
        { name: 'executor',       type: 'address' },
        { name: 'nonce',          type: 'uint256' },
        { name: 'signerToRemove', type: 'address' },
        { name: 'signerToAdd',    type: 'address' },
        { name: 'deadline',       type: 'uint256' },
      ],
  }, {
    executor:       executor,
    nonce:          String(nonce),
    signerToRemove: signerToRemove,
    signerToAdd:    signerToAdd,
    deadline:       String(deadline),
  });

  const sortedSignatures = sortSignatures(digest, signatures);

  try {
    const treasury = IOrderbookDEXTeamTreasury.at(treasuryAddress[chainId]);
    await treasury.callStatic.replaceSigner(signerToRemove, signerToAdd, deadline, sortedSignatures);
    await treasury.sendTransaction.replaceSigner(signerToRemove, signerToAdd, deadline, sortedSignatures);

  } finally {
    if (abortSignal?.aborted) throw abortSignal.reason;
  }
}
