"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, Wallet, Banknote, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useDataApi } from "@/hooks/use-data-api";
import { ethers } from "ethers";

const AdminWalletStatus = () => {
  const { session, loading: authLoading, logout } = useAuth();
  const { adminStatus, isAdminStatusLoading, refetchAllData } = useDataApi();

  const isAdmin = session?.role === "admin";
  const [userBalance, setUserBalance] = useState<string | null>(null);

  const sessionLooksLikeAddress = useMemo(
    () => !!session?.email && /^0x[a-fA-F0-9]{40}$/.test(session.email),
    [session?.email]
  );

  useEffect(() => {
    const loadUserBalance = async () => {
      if (!isAdmin && sessionLooksLikeAddress && typeof window !== "undefined" && window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum as unknown as ethers.Eip1193Provider);
          const bal = await provider.getBalance(session!.email);
          setUserBalance(ethers.formatEther(bal));
        } catch {
          setUserBalance(null);
        }
      }
    };
    loadUserBalance();
  }, [isAdmin, sessionLooksLikeAddress, session]);

  const isLoading = authLoading || (isAdmin ? isAdminStatusLoading : false);
  if (isLoading) {
    return <Loader2 className="h-6 w-6 animate-spin text-primary" />;
  }
  if (!session) {
    return null;
  }

  const displayLabel = isAdmin ? "Admin" : "Wallet";
  const displayAddress = isAdmin
    ? adminStatus?.address
      ? `${adminStatus.address.substring(0, 6)}...`
      : "N/A"
    : sessionLooksLikeAddress
    ? `${session.email.substring(0, 6)}...`
    : "N/A";
  const fmt = (val?: string | null) => {
    if (!val) return "N/A";
    const [i, d = ""] = String(val).split(".");
    return d ? `${i}.${d.slice(0, 6)} ETH` : `${i} ETH`;
  };
  const displayBalance = isAdmin ? fmt(adminStatus?.balance) : fmt(userBalance);

  const handleRefresh = async () => {
    if (isAdmin) {
      refetchAllData();
    } else if (sessionLooksLikeAddress && typeof window !== "undefined" && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum as unknown as ethers.Eip1193Provider);
        const bal = await provider.getBalance(session!.email);
        setUserBalance(ethers.formatEther(bal));
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="hidden md:flex flex-col items-end text-xs">
        <span className="font-medium text-muted-foreground flex items-center gap-1">
          <Wallet className="h-3 w-3" /> {displayLabel}: {displayAddress}
        </span>
        <span className="font-medium text-muted-foreground flex items-center gap-1">
          <Banknote className="h-3 w-3" /> Balance: {displayBalance}
        </span>
      </div>
      <Button onClick={handleRefresh} variant="outline" size="sm" className="px-2 py-1 h-8 w-8 dark:neon-hover" title="Refresh balance">
        <RefreshCw className="h-3 w-3" />
      </Button>
      <span className="text-sm font-medium text-primary-foreground bg-primary px-3 py-2 rounded-md flex items-center gap-2 transition-all duration-200 dark:neon-hover">
        <Mail className="h-4 w-4" />
        {session.email.substring(0, 15)}...
      </span>
      <Button onClick={logout} variant="destructive" size="sm" className="px-3 py-1 dark:neon-hover">
        Logout
      </Button>
    </div>
  );
};

export default AdminWalletStatus;
