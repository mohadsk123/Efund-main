"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, Loader2, Wallet, RefreshCw, ExternalLink } from "lucide-react";

// Placeholder for the contract address (should be configured in the backend)
interface WalletStatusCardProps {
  isConnected: boolean;
  walletAddress: string | null;
  balance: string | null;
  contractBalance: string | null;
  contractAddress?: string | null;
  userWalletAddress?: string | null;
  userChainId?: number | null;
  expectedChainId?: number | null;
  isLoading: boolean;
  error: string | null;
  connectWallet: () => void;
  disconnectWallet: () => void;
  refreshContractBalance: () => void;
  onSwitchNetwork?: () => void;
}

const WalletStatusCard = ({
  isConnected,
  walletAddress,
  balance,
  contractBalance,
  contractAddress,
  userWalletAddress,
  userChainId,
  expectedChainId,
  isLoading,
  error,
  connectWallet,
  disconnectWallet,
  refreshContractBalance,
  onSwitchNetwork,
}: WalletStatusCardProps) => {
  const addr = contractAddress || "0x0000000000000000000000000000000000000000";
  const sepoliaEtherscanUrl = `https://sepolia.etherscan.io/address/${addr}`;

  // Use the provided props, which now come from the API hook
  const displayWalletAddress = walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` : "N/A";
  const displayBalance = balance ? `${parseFloat(balance).toFixed(4)} ETH` : "N/A";

  return (
    <Card className="bg-card text-card-foreground border-border shadow-sm animate-fade-in-up delay-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Info className="h-5 w-5" /> Wallet & Contract Status
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-base">Admin Authenticated:</span>
          <span className={`font-medium ${isConnected ? "text-green-500" : "text-red-500"}`}>
            {isConnected ? "Yes" : "No"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-base">User Wallet:</span>
          <span className="font-mono text-sm text-muted-foreground">{userWalletAddress ? `${userWalletAddress.substring(0, 6)}...${userWalletAddress.substring(userWalletAddress.length - 4)}` : "N/A"}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-base">Network:</span>
            <span className="text-sm text-muted-foreground">
              {userChainId ?? "Unknown"}
              {expectedChainId && userChainId && userChainId !== expectedChainId ? " (wrong network)" : ""}
            </span>
          </div>
          {expectedChainId && userChainId && userChainId !== expectedChainId && onSwitchNetwork && (
            <Button onClick={onSwitchNetwork} variant="outline" className="h-8 px-3">
              Switch Network
            </Button>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-base">Backend Admin Address:</span>
          <span className="font-mono text-sm text-muted-foreground">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : displayWalletAddress}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-base">Admin Wallet Balance:</span>
          <span className="font-mono text-sm text-muted-foreground">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : displayBalance}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-base">Contract Address:</span>
          <a
            href={sepoliaEtherscanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-blue-500 hover:underline flex items-center gap-1"
          >
            {addr.substring(0, 6)}...{addr.substring(addr.length - 4)}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        {contractBalance && (
          <div className="flex items-center justify-between">
            <span className="text-base">Contract Balance:</span>
            <span className="font-mono text-sm text-muted-foreground">{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : `${parseFloat(contractBalance).toFixed(4)} ETH`}</span>
          </div>
        )}
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        <div className="flex gap-2 mt-4">
          <Button onClick={isConnected ? disconnectWallet : connectWallet} variant="outline" className="w-full flex items-center gap-2 dark:neon-hover">
            {isConnected ? <Wallet className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
            {isConnected ? "Disconnect Wallet" : "Connect Wallet"}
          </Button>
          <Button onClick={refreshContractBalance} disabled={isLoading} variant="outline" className="w-full flex items-center gap-2 dark:neon-hover">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh Contract Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletStatusCard;
