import { ethers } from 'ethers';

// TODO this should be provided by abi2ts-lib

export function digestTypedData(
  domain: ethers.TypedDataDomain,
  types: Record<string, ethers.TypedDataField[]>,
  data: Record<string, unknown>
) {
  return ethers.utils._TypedDataEncoder.hash(domain, types, data);
}
