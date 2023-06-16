import { Address } from '@frugalwizard/abi2ts-lib';
import { SupportedChainId } from './SupportedChainId';

export const treasuryAddress: { readonly [chainId in SupportedChainId]: Address } = {
  [SupportedChainId.GOERLI]:    '0x2062236a0eD977B3B3FeF342880Fc9Dc0C888933',
  [SupportedChainId.SEPOLIA]:   '0x4a5415FB93edab918d3A1bfF1f9A7f693B264f98',
  [SupportedChainId.LOCALHOST]: '0xF2E246BB76DF876Cef8b38ae84130F4F55De395b',
};
