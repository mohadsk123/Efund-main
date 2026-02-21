"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PiggyBank, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DepositFundsCardProps {
  isConnected: boolean;
  depositFundsToContract: (amountEth: string) => Promise<boolean>;
  isDepositingFunds: boolean;
  estimateDepositGas: (amountEth: string) => Promise<{ gas: string; costEth: string } | null>;
}

const DepositFundsCard = ({
  isConnected,
  depositFundsToContract,
  isDepositingFunds,
  estimateDepositGas,
}: DepositFundsCardProps) => {
  const [depositAmount, setDepositAmount] = useState("");

  const handleDepositFunds = async () => {
    if (!isConnected) {
      toast.error("Please log in first.");
      return;
    }
    if (!depositAmount) {
      toast.error("Please enter an amount to deposit.");
      return;
    }
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid positive amount to deposit.");
      return;
    }
    const est = await estimateDepositGas(depositAmount);
    if (est) {
      const ok = window.confirm(`Estimated cost: ~${parseFloat(est.costEth).toFixed(6)} ETH. Proceed?`);
      if (!ok) return;
    }
    const success = await depositFundsToContract(depositAmount);
    if (success) {
      setDepositAmount("");
    }
  };

  return (
    <Card className="bg-card text-card-foreground border-border shadow-sm animate-fade-in-up delay-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <PiggyBank className="h-5 w-5" /> Deposit Funds to Contract
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="deposit-amount" className="text-base">Amount (ETH)</Label>
          <Input
            id="deposit-amount"
            type="number"
            step="0.001"
            placeholder="0.5"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="bg-muted text-muted-foreground border-border h-10 text-base dark:neon-focus"
          />
        </div>
        <Button onClick={handleDepositFunds} disabled={!isConnected || isDepositingFunds} className="w-full flex items-center gap-2 h-10 text-base dark:neon-hover">
          {isDepositingFunds ? <Loader2 className="h-4 w-4 animate-spin" /> : <PiggyBank className="h-4 w-4" />}
          {isDepositingFunds ? "Depositing..." : "Deposit ETH"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DepositFundsCard;
