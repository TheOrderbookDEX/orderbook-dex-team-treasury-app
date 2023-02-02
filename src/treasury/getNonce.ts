import { IOrderbookDEXTeamTreasury } from '@theorderbookdex/orderbook-dex-team-treasury/dist/interfaces/IOrderbookDEXTeamTreasury';
import { SupportedChainId } from './SupportedChainId';
import { treasuryAddress } from './treasuryAddress';

export async function getNonce(chainId: SupportedChainId, abortSignal?: AbortSignal): Promise<bigint> {
  try {
    const treasury = IOrderbookDEXTeamTreasury.at(treasuryAddress[chainId]);
    return await treasury.nonce();

  } finally {
    if (abortSignal?.aborted) throw abortSignal.reason;
  }
}
