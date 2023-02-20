import { ecrecover } from '@frugalwizard/abi2ts-lib';

export function sortSignatures(digest: string, signatures: string[]): string[] {
  return signatures
    .map(signature => [ signature, ecrecover(digest, signature) ])
    .sort(([ , address1 ], [ , address2 ]) => {
      const diff = BigInt(address1) - BigInt(address2);
      return diff > 0n ? 1 : diff < 0n ? -1 : 0;
    })
    .map(([ signature ]) => signature);
}
