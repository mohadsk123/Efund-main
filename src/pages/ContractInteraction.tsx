"use client";

import { Wallet } from "lucide-react";
import { useDataApi } from "@/hooks/use-data-api"; // Import new API hook
import { toast } from "sonner";
import { useState } from "react";
import { useWallet } from "@/hooks/use-wallet";

// Import modular components
import WalletStatusCard from "@/components/contract-interaction/WalletStatusCard";
import AddBeneficiaryCard from "@/components/contract-interaction/AddBeneficiaryCard";
import ApproveBeneficiaryCard from "@/components/contract-interaction/ApproveBeneficiaryCard";
import DisburseFundsCard from "@/components/contract-interaction/DisburseFundsCard";
import DepositFundsCard from "@/components/contract-interaction/DepositFundsCard";
import QueryBeneficiaryCard from "@/components/contract-interaction/QueryBeneficiaryCard";
import GlobalStatsCard from "@/components/contract-interaction/GlobalStatsCard";
import RecentDisbursementsTable from "@/components/contract-interaction/RecentDisbursementsTable";

const ContractInteraction = () => {
  const {
    isAuthenticated,
    globalStats,
    isGlobalStatsLoading,
    contractMeta,
    adminStatus, // Destructure adminStatus
    isAdminStatusLoading, // Destructure isAdminStatusLoading
    disbursements,
    isDisbursementsLoading,
    isAddingBeneficiary,
    isApprovingBeneficiary,
    isDisbursingFunds,
    isDepositingFunds,
    refetchAllData,
    addBeneficiary,
    approveBeneficiary,
    disburseFunds,
    depositFundsToContract,
    queryBeneficiaryDetails,
    estimateDepositGas,
    estimateAddGas,
    estimateApproveGas,
    estimateDisburseGas,
  } = useDataApi();
  const { address, chainId, connect, disconnect, ensureChain } = useWallet();

  // State for queried beneficiary details
  type QueriedBeneficiary = { name?: string; scheme?: string; approved?: boolean; totalReceived?: string };
  const [queriedBeneficiary, setQueriedBeneficiary] = useState<QueriedBeneficiary | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);

  const handleQueryBeneficiary = async (address: string) => {
    setIsQuerying(true);
    const details = await queryBeneficiaryDetails(address);
    setQueriedBeneficiary(details);
    setIsQuerying(false);
  };

  // Simulate refresh functions (now just refetching API data)
  const refreshContractData = () => {
    refetchAllData();
    toast.success("Contract data refresh requested from API.");
  };

  return (
    <div className="flex flex-col gap-8 px-6 py-8 animate-fade-in-up">
      <div className="flex items-center gap-3 text-primary">
        <Wallet className="h-7 w-7" />
        <h2 className="text-4xl font-bold tracking-tight text-foreground">Blockchain Fund Management</h2>
      </div>
      <p className="text-lg text-muted-foreground max-w-2xl">
        Interact with the E-Fund smart contract via the Node.js/Express API configured in the app settings.
      </p>

      <WalletStatusCard
        isConnected={isAuthenticated}
        walletAddress={adminStatus?.address ?? null}
        balance={adminStatus?.balance ?? null}
        contractBalance={globalStats?.contractBalance ?? null}
        contractAddress={contractMeta?.contractAddress ?? null}
        userWalletAddress={address}
        userChainId={chainId}
        expectedChainId={contractMeta?.chainId ?? null}
        isLoading={isAdminStatusLoading || isGlobalStatsLoading}
        error={null}
        connectWallet={connect}
        disconnectWallet={disconnect}
        refreshContractBalance={refreshContractData}
        onSwitchNetwork={contractMeta?.chainId ? () => ensureChain(contractMeta.chainId!) : undefined}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <AddBeneficiaryCard
          isConnected={isAuthenticated}
          addBeneficiary={addBeneficiary}
          isAddingBeneficiary={isAddingBeneficiary}
          estimateAddGas={estimateAddGas}
        />

        <ApproveBeneficiaryCard
          isConnected={isAuthenticated}
          approveBeneficiary={approveBeneficiary}
          isApprovingBeneficiary={isApprovingBeneficiary}
          estimateApproveGas={estimateApproveGas}
        />

        <DisburseFundsCard
          isConnected={isAuthenticated}
          disburseFunds={disburseFunds}
          isDisbursingFunds={isDisbursingFunds}
          estimateDisburseGas={estimateDisburseGas}
        />

        <DepositFundsCard
          isConnected={isAuthenticated}
          depositFundsToContract={depositFundsToContract}
          isDepositingFunds={isDepositingFunds}
          estimateDepositGas={estimateDepositGas}
        />

        <QueryBeneficiaryCard
          isConnected={isAuthenticated}
          queryBeneficiaryDetails={handleQueryBeneficiary}
          queriedBeneficiary={queriedBeneficiary}
          isQuerying={isQuerying}
        />
      </div>

      <GlobalStatsCard
        isConnected={isAuthenticated}
        globalStats={globalStats}
        isGlobalStatsLoading={isGlobalStatsLoading}
        refreshContractData={refreshContractData}
      />

      <RecentDisbursementsTable
        isConnected={isAuthenticated}
        disbursements={disbursements}
        isDisbursementsLoading={isDisbursementsLoading}
      />
    </div>
  );
};

export default ContractInteraction;
