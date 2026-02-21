"use client";

import OverviewCard from "@/components/dashboard/OverviewCard";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import SchemesOverviewChart from "@/components/dashboard/SchemesOverviewChart";
import QuickLinksCarousel from "@/components/dashboard/QuickLinksCarousel";
import ActiveSchemeCard from "@/components/dashboard/ActiveSchemeCard";
import BlockchainTransactionCard from "@/components/dashboard/BlockchainTransactionCard";
import { LayoutDashboard, Users, DollarSign, Repeat, TrendingUp, ShieldCheck, Handshake, PiggyBank, Landmark, Loader2 } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useDataApi } from "@/hooks/use-data-api";

const Index = () => {
  const {
    isAuthenticated,
    globalStats,
    isGlobalStatsLoading,
    disbursements,
    isDisbursementsLoading,
    schemes,
    isLoadingSchemes
  } = useDataApi();

  const totalApprovedBeneficiaries = globalStats?.totalApprovedBeneficiaries ?? 0;
  const totalFundsDisbursed = globalStats?.totalFundsDisbursed ?? "0";
  const totalSchemesCount = globalStats?.totalSchemes ?? 0;
  const totalTransactionsCount = disbursements.length;

  // Use disbursements directly for recent transactions display
  const recentBlockchainTransactions = disbursements.slice(0, 4);

  const connectionStatusText = isAuthenticated ? "Authenticated" : "Unauthenticated";

  return (
    <div className="flex flex-col gap-8 px-6 py-8 animate-fade-in-up">
      <h2 className="text-4xl font-bold tracking-tight text-foreground">Dashboard Overview</h2>
      <p className="text-lg text-muted-foreground max-w-2xl">
        A comprehensive overview of the E-Fund System's key metrics and recent activities.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <OverviewCard
          title="Total Schemes"
          value={
            isGlobalStatsLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              totalSchemesCount.toString()
            )
          }
          description="Active on blockchain"
          icon={<LayoutDashboard className="h-5 w-5 text-muted-foreground" />}
          className="animate-fade-in-up"
        />
        <OverviewCard
          title="Total Beneficiaries"
          value={
            isGlobalStatsLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              totalApprovedBeneficiaries.toLocaleString()
            )
          }
          description={isAuthenticated ? "Registered users" : `Status: ${connectionStatusText}`}
          icon={<Users className="h-5 w-5 text-muted-foreground" />}
          className="animate-fade-in-up delay-100"
        />
        <OverviewCard
          title="Funds Disbursed"
          value={
            isGlobalStatsLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              `Ξ${parseFloat(totalFundsDisbursed).toFixed(2)}`
            )
          }
          description={isAuthenticated ? "Total ETH sent" : `Status: ${connectionStatusText}`}
          icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
          className="animate-fade-in-up delay-200"
        />
        <OverviewCard
          title="Total Transactions"
          value={
            isDisbursementsLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              totalTransactionsCount.toLocaleString()
            )
          }
          description={isAuthenticated ? "Blockchain events" : `Status: ${connectionStatusText}`}
          icon={<Repeat className="h-5 w-5 text-muted-foreground" />}
          className="animate-fade-in-up delay-300"
        />
      </div>

      {/* Active Welfare Schemes & Blockchain Transactions */}
      <div className="grid gap-6 lg:grid-cols-2 mt-8">
        {/* Active Welfare Schemes (Real Data) */}
        <div className="bg-card text-card-foreground border-border shadow-sm animate-fade-in-up delay-400 rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-semibold">Active Welfare Schemes</CardTitle>
            <Link to="/schemes" className="text-primary hover:underline p-0 h-auto">
              View All <span className="ml-1 text-xl">→</span>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingSchemes ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : schemes.length > 0 ? (
              schemes.slice(0, 3).map((scheme) => (
                <ActiveSchemeCard
                  key={scheme.id}
                  icon={Handshake}
                  schemeName={scheme.name}
                  status={scheme.isActive ? "Active" : "Archived"}
                  allocated={`${scheme.budget} ETH`}
                  utilized="N/A"
                  beneficiaries="N/A"
                  utilizationPercentage={0}
                  isVerified={true}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">No active schemes found.</div>
            )}
          </CardContent>
        </div>

        {/* Blockchain Transactions */}
        <div className="bg-card text-card-foreground border-border shadow-sm animate-fade-in-up delay-500 rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-semibold">Blockchain Transactions</CardTitle>
            <Link to="/transactions" className="text-primary hover:underline p-0 h-auto">
              View All <span className="ml-1 text-xl">→</span>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {isDisbursementsLoading ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading transactions...
              </div>
            ) : recentBlockchainTransactions.length > 0 ? (
              recentBlockchainTransactions.map((tx, index) => (
                <BlockchainTransactionCard
                  key={tx.hash || index}
                  txId={tx.hash ? `TXN-${tx.hash.substring(0, 6)}` : `TXN-D-${index}`}
                  status={"Completed"}
                  schemeBeneficiary={`${tx.scheme || "Disbursement"} • ${tx.beneficiaryAddress?.substring(0, 6)}...`}
                  amount={`Ξ${parseFloat(tx.amount).toFixed(4)}`}
                  timestamp={tx.timestamp}
                  hash={tx.hash}
                />
              ))
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                No recent blockchain transactions found.
              </div>
            )}
          </CardContent>
        </div>
      </div>

      <QuickLinksCarousel className="animate-fade-in-up delay-600" />

      {/* Key Metrics Section */}
      <h3 className="text-2xl font-bold tracking-tight text-foreground mt-4 animate-fade-in-up delay-700">Key Metrics</h3>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <OverviewCard
          title="Growth Rate"
          value="+2.5%"
          description="Beneficiary growth this quarter"
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
          className="animate-fade-in-up delay-800 dark:neon-hover"
        />
        <OverviewCard
          title="Security Score"
          value="A+"
          description="Last audit: 2024-09-01"
          icon={<ShieldCheck className="h-5 w-5 text-blue-500" />}
          className="animate-fade-in-up delay-900 dark:neon-hover"
        />
        <OverviewCard
          title="Active Users"
          value="500K+"
          description="Daily active users"
          icon={<Users className="h-5 w-5 text-muted-foreground" />}
          className="animate-fade-in-up delay-1000 dark:neon-hover"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <RecentTransactions className="animate-fade-in-up delay-1100" />
        <SchemesOverviewChart className="animate-fade-in-up delay-1200" />
      </div>
    </div>
  );
};

export default Index;