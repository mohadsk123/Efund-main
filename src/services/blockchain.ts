import { ethers } from "ethers";

export const SEPOLIA_CHAIN_ID = 11155111;

export const toHexChainId = (id: number) => "0x" + Number(id).toString(16);

export const getBrowserProvider = () => {
  if (!window.ethereum) throw new Error("Wallet not detected");
  const ethAny = window.ethereum as unknown as { providers?: unknown[] } & ethers.Eip1193Provider;
  const source =
    Array.isArray(ethAny.providers) && ethAny.providers.length > 0
      ? (ethAny.providers as Array<Record<string, unknown>>).find((p) => Object.prototype.hasOwnProperty.call(p, "isMetaMask")) ||
        (ethAny.providers as Array<Record<string, unknown>>)[0]
      : ethAny;
  return new ethers.BrowserProvider(source as unknown as ethers.Eip1193Provider);
};

export type ChainMeta = {
  chainId: number;
  chainName: string;
  rpcUrls: string[];
  nativeCurrency: { name: string; symbol: string; decimals: number };
  blockExplorerUrls?: string[];
};

const DEFAULTS: Record<number, ChainMeta> = {
  11155111: {
    chainId: 11155111,
    chainName: "Sepolia Test Network",
    rpcUrls: ["https://rpc.sepolia.org"],
    nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
  },
};

export const ensureChain = async (targetChainId: number, meta?: ChainMeta) => {
  if (!window.ethereum) return false;
  const chainIdHex = toHexChainId(targetChainId);
  try {
    await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: chainIdHex }] });
    return true;
  } catch (err: unknown) {
    const code = (err as { code?: number })?.code;
    if (code === 4902) {
      try {
        const m = meta ?? DEFAULTS[targetChainId];
        if (!m) return false;
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: chainIdHex,
            chainName: m.chainName,
            rpcUrls: m.rpcUrls,
            nativeCurrency: m.nativeCurrency,
            blockExplorerUrls: m.blockExplorerUrls
          }]
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
};

export const getBalance = async (address: string) => {
  const provider = getBrowserProvider();
  const bal = await provider.getBalance(address);
  return ethers.formatEther(bal);
};

export const onAccountsChanged = (cb: (accounts: string[]) => void) => {
  const handler = (...args: unknown[]) => {
    const accounts = (args && Array.isArray(args[0]) ? (args[0] as string[]) : []);
    cb(accounts);
  };
  window.ethereum?.on?.("accountsChanged", handler as (...args: unknown[]) => void);
  return () => window.ethereum?.removeListener?.("accountsChanged", handler as (...args: unknown[]) => void);
};

export const onChainChanged = (cb: (chainIdHex: string) => void) => {
  const handler = (...args: unknown[]) => {
    const chainIdHex = (args && typeof args[0] === "string") ? (args[0] as string) : "0x0";
    cb(chainIdHex);
  };
  window.ethereum?.on?.("chainChanged", handler as (...args: unknown[]) => void);
  return () => window.ethereum?.removeListener?.("chainChanged", handler as (...args: unknown[]) => void);
};

export const onBlock = async (cb: (blockNumber: number) => void) => {
  const provider = getBrowserProvider();
  const listener = (bn: number) => cb(Number(bn));
  provider.on("block", listener);
  return () => provider.off("block", listener);
};

export const watchTx = async (hash: string, cb: (status: "pending" | "success" | "failed") => void) => {
  const provider = getBrowserProvider();
  cb("pending");
  try {
    const receipt = await provider.waitForTransaction(hash, 1);
    if (receipt?.status === 1) cb("success");
    else cb("failed");
  } catch {
    cb("failed");
  }
};
