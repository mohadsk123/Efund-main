type EIP1193Request = { method: string; params?: unknown[] };
interface EthereumProvider {
  request: (args: EIP1193Request) => Promise<unknown>;
  on?: (eventName: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (eventName: string, listener: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export {};
