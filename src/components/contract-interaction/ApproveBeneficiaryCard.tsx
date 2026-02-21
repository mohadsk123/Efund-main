"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ApproveBeneficiaryCardProps {
  isConnected: boolean;
  approveBeneficiary: (beneficiaryAddress: string) => Promise<boolean>;
  isApprovingBeneficiary: boolean;
  estimateApproveGas: (beneficiaryAddress: string) => Promise<{ gas: string; costEth: string } | null>;
}

const isValidAddress = (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address);

const ApproveBeneficiaryCard = ({
  isConnected,
  approveBeneficiary,
  isApprovingBeneficiary,
  estimateApproveGas,
}: ApproveBeneficiaryCardProps) => {
  const [approveBeneficiaryAddress, setApproveBeneficiaryAddress] = useState("");

  const handleApproveBeneficiary = async () => {
    if (!isConnected) {
      toast.error("Please log in first.");
      return;
    }
    if (!approveBeneficiaryAddress) {
      toast.error("Please enter a beneficiary address to approve.");
      return;
    }
    if (!isValidAddress(approveBeneficiaryAddress)) {
      toast.error("Invalid beneficiary address format.");
      return;
    }
    const est = await estimateApproveGas(approveBeneficiaryAddress);
    if (est) {
      const ok = window.confirm(`Estimated cost: ~${parseFloat(est.costEth).toFixed(6)} ETH. Proceed?`);
      if (!ok) return;
    }
    const success = await approveBeneficiary(approveBeneficiaryAddress);
    if (success) {
      setApproveBeneficiaryAddress("");
    }
  };

  return (
    <Card className="bg-card text-card-foreground border-border shadow-sm animate-fade-in-up delay-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <CheckCircle className="h-5 w-5" /> Approve Beneficiary
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="approve-beneficiary-address" className="text-base">Beneficiary Address</Label>
          <Input
            id="approve-beneficiary-address"
            placeholder="0x..."
            value={approveBeneficiaryAddress}
            onChange={(e) => setApproveBeneficiaryAddress(e.target.value)}
            className="bg-muted text-muted-foreground border-border h-10 text-base dark:neon-focus"
          />
        </div>
        <Button onClick={handleApproveBeneficiary} disabled={!isConnected || isApprovingBeneficiary} className="w-full flex items-center gap-2 h-10 text-base dark:neon-hover">
          {isApprovingBeneficiary ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
          {isApprovingBeneficiary ? "Approving..." : "Approve Beneficiary"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ApproveBeneficiaryCard;
