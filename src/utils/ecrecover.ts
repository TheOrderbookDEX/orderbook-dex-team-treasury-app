import { ethers } from 'ethers';

// TODO this should be provided by abi2ts-lib

export function ecrecover(digest: string, signature: string) {
  return ethers.utils.recoverAddress(digest, signature);
}
