export function parseVersion(version: string): bigint {
  const [ major, minor, patch ] = version.split('.').map(BigInt);
  return major * 10000n + (minor ?? 0n) * 100n + (patch ?? 0n);
}
