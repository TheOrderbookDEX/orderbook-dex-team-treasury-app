import { Address } from '@frugalwizard/abi2ts-lib';
import { IOrderbookDEXTeamTreasury } from '@theorderbookdex/orderbook-dex-team-treasury/dist/interfaces/IOrderbookDEXTeamTreasury';
import { SupportedChainId } from './SupportedChainId';
import { treasuryAddress } from './treasuryAddress';

// TODO fix wrong gas estimation

export async function claimFees(chainId: SupportedChainId, orderbooks: Address[], abortSignal?: AbortSignal): Promise<void> {
  try {
    const treasury = IOrderbookDEXTeamTreasury.at(treasuryAddress[chainId]);
    await treasury.callStatic.claimFees(orderbooks);
    await treasury.sendTransaction.claimFees(orderbooks);

  } finally {
    if (abortSignal?.aborted) throw abortSignal.reason;
  }
}
