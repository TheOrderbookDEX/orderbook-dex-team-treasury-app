import { Address } from '@frugal-wizard/abi2ts-lib';
import { SupportedChainId } from './SupportedChainId';

export const treasuryAddress: { readonly [chainId in SupportedChainId]: Address } = {
  [SupportedChainId.LOCALHOST]: '0xF2E246BB76DF876Cef8b38ae84130F4F55De395b',
};
