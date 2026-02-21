import { useEffect, useState, useCallback } from "react";

type WalletState = {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
};

export function useWallet() {
  const [state, setState] = useState<WalletState>({ isConnected: false, address: null, chainId: null });

  const readChainId = async () => {
    if (!window.ethereum) return null;
    try {
      const hex = (await window.ethereum.request({ method: "eth_chainId" })) as string;
      return parseInt(hex, 16);
    } catch {
      return null;
    }
  };

  const connect = useCallback(async () => {
    if (!window.ethereum) return;
    const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
    const chain = await readChainId();
    const addr = accounts && accounts[0] ? accounts[0] : null;
    setState({ isConnected: !!addr, address: addr, chainId: chain });
  }, []);

  const disconnect = useCallback(() => {
    setState({ isConnected: false, address: null, chainId: null });
  }, []);

  const ensureChain = useCallback(async (targetChainId: number) => {
    if (!window.ethereum) return false;
    const hex = "0x" + Number(targetChainId).toString(16);
    try {
      await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: hex }] });
      setState(s => ({ ...s, chainId: targetChainId }));
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;
    const eth = window.ethereum as unknown as { on?: (e: string, fn: (...args: unknown[]) => void) => void; removeListener?: (e: string, fn: (...args: unknown[]) => void) => void };
    const onAccountsChanged = (...args: unknown[]) => {
      const accounts = (args && Array.isArray(args[0]) ? (args[0] as unknown[]) : []) as string[];
      const addr = accounts && accounts[0] ? accounts[0] : null;
      setState(s => ({ ...s, isConnected: !!addr, address: addr }));
    };
    const onChainChanged = (...args: unknown[]) => {
      const chainIdHex = (args && typeof args[0] === "string") ? (args[0] as string) : "0x0";
      const id = parseInt(chainIdHex, 16);
      setState(s => ({ ...s, chainId: id }));
    };
    window.ethereum.request({ method: "eth_accounts" }).then((accs: unknown) => {
      const a = accs as string[];
      if (a && a[0]) setState(s => ({ ...s, isConnected: true, address: a[0] }));
    }).catch(() => {});
    readChainId().then(id => setState(s => ({ ...s, chainId: id }))).catch(() => {});
    eth.on?.("accountsChanged", onAccountsChanged);
    eth.on?.("chainChanged", onChainChanged);
    return () => {
      eth?.removeListener?.("accountsChanged", onAccountsChanged);
      eth?.removeListener?.("chainChanged", onChainChanged);
    };
  }, []);

  return {
    isConnected: state.isConnected,
    address: state.address,
    chainId: state.chainId,
    connect,
    disconnect,
    ensureChain,
  };
}
