export interface Ethereum {
  request(args: { method: 'eth_chainId' }): Promise<string>;
  request(args: { method: 'eth_accounts' }): Promise<string[]>;
  request(args: { method: 'eth_requestAccounts' }): Promise<string[]>;
  request(args: { method: 'eth_signTypedData_v4', params: [ signer: string, data: string ] }): Promise<string>;
  on(eventName: 'chainChanged', listener: (chainId: string) => void): void;
  on(eventName: 'accountsChanged', listener: (accounts: string[]) => void): void;
  removeListener(eventName: 'chainChanged', listener: (chainId: string) => void): void;
  removeListener(eventName: 'accountsChanged', listener: (accounts: string[]) => void): void;
}

export function getEthereum(): Ethereum | undefined {
  const global = globalThis as { ethereum?: Ethereum };
  return 'ethereum' in global && global.ethereum ? global.ethereum : undefined;
}

export function requireEthereum(): Ethereum {
  const ethereum = getEthereum();
  if (!ethereum) throw new Error('No ethereum provider');
  return ethereum;
}

export async function getChainId(abortSignal?: AbortSignal) {
  const ethereum = requireEthereum();

  try {
    return Number(await ethereum.request({ method: 'eth_chainId' }));

  } finally {
    if (abortSignal?.aborted) throw abortSignal.reason;
  }
}

export async function getAccount(abortSignal?: AbortSignal): Promise<string> {
  const ethereum = requireEthereum();

  try {
    const [ account ] = await ethereum.request({ method: 'eth_accounts' });
    return account ?? '';

  } finally {
    if (abortSignal?.aborted) throw abortSignal.reason;
  }
}

export async function requestAccount(abortSignal?: AbortSignal): Promise<string> {
  const ethereum = requireEthereum();

  try {
    const [ account ] = await ethereum.request({ method: 'eth_requestAccounts' });
    if (!account) throw new Error('No ethereum account');
    return account;

  } finally {
    if (abortSignal?.aborted) throw abortSignal.reason;
  }
}

export async function signTypedData(data: unknown, abortSignal?: AbortSignal) {
  const ethereum = requireEthereum();
  const account = await getAccount(abortSignal);
  if (!account) throw new Error('No account to sign data');

  try {
    return await ethereum.request({ method: 'eth_signTypedData_v4', params: [ account, JSON.stringify(data) ] });

  } finally {
    if (abortSignal?.aborted) throw abortSignal.reason;
  }
}
