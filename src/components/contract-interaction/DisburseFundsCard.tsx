"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DisburseFundsCardProps {
  isConnected: boolean;
  disburseFunds: (beneficiaryAddress: string, amountEth: string) => Promise<boolean>;
  isDisbursingFunds: boolean;
  estimateDisburseGas: (beneficiaryAddress: string, amountEth: string) => Promise<{ gas: string; costEth: string } | null>;
}

const isValidAddress = (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address);

const DisburseFundsCard = ({
  isConnected,
  disburseFunds,
  isDisbursingFunds,
  estimateDisburseGas,
}: DisburseFundsCardProps) => {
  const [disburseBeneficiaryAddress, setDisburseBeneficiaryAddress] = useState("");
  const [disburseAmount, setDisburseAmount] = useState("");

  const handleDisburseFunds = async () => {
    if (!isConnected) {
      toast.error("Please log in first.");
      return;
    }
    if (!disburseBeneficiaryAddress || !disburseAmount) {
      toast.error("Please enter beneficiary address and amount for disbursement.");
      return;
    }
    if (!isValidAddress(disburseBeneficiaryAddress)) {
      toast.error("Invalid beneficiary address format.");
      return;
    }
    const amount = parseFloat(disburseAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid positive amount to disburse.");
      return;
    }
    const est = await estimateDisburseGas(disburseBeneficiaryAddress, disburseAmount);
    if (est) {
      const ok = window.confirm(`Estimated cost: ~${parseFloat(est.costEth).toFixed(6)} ETH. Proceed?`);
      if (!ok) return;
    }
    const success = await disburseFunds(disburseBeneficiaryAddress, disburseAmount);
    if (success) {
      setDisburseBeneficiaryAddress("");
      setDisburseAmount("");
    }
  };

  return (
    <Card className="bg-card text-card-foreground border-border shadow-sm animate-fade-in-up delay-400">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <DollarSign className="h-5 w-5" /> Disburse Funds
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="disburse-beneficiary-address" className="text-base">Beneficiary Address</Label>
          <Input
            id="disburse-beneficiary-address"
            placeholder="0x..."
            value={disburseBeneficiaryAddress}
            onChange={(e) => setDisburseBeneficiaryAddress(e.target.value)}
            className="bg-muted text-muted-foreground border-border h-10 text-base dark:neon-focus"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="disburse-amount" className="text-base">Amount (ETH)</Label>
          <Input
            id="disburse-amount"
            type="number"
            step="0.001"
            placeholder="0.1"
            value={disburseAmount}
            onChange={(e) => setDisburseAmount(e.target.value)}
            className="bg-muted text-muted-foreground border-border h-10 text-base dark:neon-focus"
          />
        </div>
        <Button onClick={handleDisburseFunds} disabled={!isConnected || isDisbursingFunds} className="w-full flex items-center gap-2 h-10 text-base dark:neon-hover">
          {isDisbursingFunds ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
          {isDisbursingFunds ? "Disbursing..." : "Disburse Funds"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DisburseFundsCard;
