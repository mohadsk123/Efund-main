"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, Banknote, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface GlobalStats {
  totalApprovedBeneficiaries: number;
  totalFundsDisbursed: string;
  contractBalance: string;
}

interface GlobalStatsCardProps {
  isConnected: boolean;
  globalStats: GlobalStats | null;
  isGlobalStatsLoading: boolean;
  refreshContractData: () => void;
}

const GlobalStatsCard = ({
  isConnected,
  globalStats,
  isGlobalStatsLoading,
  refreshContractData,
}: GlobalStatsCardProps) => {
  const handleRefreshGlobalStats = () => {
    if (!isConnected) {
      toast.error("Please log in to refresh stats.");
      return;
    }
    refreshContractData();
  };

  return (
    <Card className="lg:col-span-2 bg-card text-card-foreground border-border shadow-sm animate-fade-in-up delay-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Banknote className="h-5 w-5" /> Global Contract Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted rounded-md border border-border dark:neon-hover">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">Total Approved Beneficiaries:</span>
          </div>
          {isGlobalStatsLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <span className="text-sm font-semibold text-foreground">{globalStats?.totalApprovedBeneficiaries !== undefined ? globalStats.totalApprovedBeneficiaries.toLocaleString() : "N/A"}</span>
          )}
        </div>
        <div className="flex items-center justify-between p-3 bg-muted rounded-md border border-border dark:neon-hover">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">Total Funds Disbursed:</span>
          </div>
          {isGlobalStatsLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <span className="text-sm font-semibold text-foreground">{globalStats?.totalFundsDisbursed !== undefined ? `${parseFloat(globalStats.totalFundsDisbursed).toFixed(4)} ETH` : "N/A"}</span>
          )}
        </div>
        <div className="flex items-center justify-between p-3 bg-muted rounded-md border border-border dark:neon-hover">
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">Current Contract Balance:</span>
          </div>
          {isGlobalStatsLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <span className="text-sm font-semibold text-foreground">{globalStats?.contractBalance !== undefined ? `${parseFloat(globalStats.contractBalance).toFixed(4)} ETH` : "N/A"}</span>
          )}
        </div>
        <Button onClick={handleRefreshGlobalStats} disabled={isGlobalStatsLoading || !isConnected} variant="outline" className="w-full flex items-center gap-2 h-10 text-base dark:neon-hover">
          {isGlobalStatsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh Global Stats
        </Button>
      </CardContent>
    </Card>
  );
};

export default GlobalStatsCard;