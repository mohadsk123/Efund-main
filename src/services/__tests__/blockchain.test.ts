import { describe, it, expect, beforeEach, vi } from "vitest";
import { toHexChainId, ensureChain } from "@/services/blockchain";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (e: string, fn: (...args: unknown[]) => void) => void;
      removeListener?: (e: string, fn: (...args: unknown[]) => void) => void;
    };
  }
}

describe("blockchain service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("toHexChainId converts number to 0x hex", () => {
    expect(toHexChainId(11155111)).toBe("0xaa36a7");
    expect(toHexChainId(1)).toBe("0x1");
  });

  it("ensureChain switches chain when available", async () => {
    const req = vi.fn().mockResolvedValueOnce(undefined);
    window.ethereum = { request: req };
    const ok = await ensureChain(11155111);
    expect(ok).toBe(true);
    expect(req).toHaveBeenCalledWith({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xaa36a7" }],
    });
  });

  it("ensureChain adds chain if not installed", async () => {
    const err: { code: number } & Error = Object.assign(new Error("Unrecognized chain"), { code: 4902 });
    const req = vi.fn()
      .mockRejectedValueOnce(err)
      .mockResolvedValueOnce(undefined);
    window.ethereum = { request: req };
    const ok = await ensureChain(11155111);
    expect(ok).toBe(true);
    expect(req).toHaveBeenCalledTimes(2);
  });
});
