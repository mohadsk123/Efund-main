"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AddBeneficiaryCardProps {
  isConnected: boolean;
  addBeneficiary: (beneficiaryAddress: string, name: string, scheme: string) => Promise<boolean>;
  isAddingBeneficiary: boolean;
  estimateAddGas: (beneficiaryAddress: string, name: string, scheme: string) => Promise<{ gas: string; costEth: string } | null>;
}

const isValidAddress = (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address);

const AddBeneficiaryCard = ({
  isConnected,
  addBeneficiary,
  isAddingBeneficiary,
  estimateAddGas,
}: AddBeneficiaryCardProps) => {
  const [newBeneficiaryAddress, setNewBeneficiaryAddress] = useState("");
  const [newBeneficiaryName, setNewBeneficiaryName] = useState("");
  const [newBeneficiaryScheme, setNewBeneficiaryScheme] = useState("");

  const handleAddBeneficiary = async () => {
    if (!isConnected) {
      toast.error("Please log in first.");
      return;
    }
    if (!newBeneficiaryAddress || !newBeneficiaryName || !newBeneficiaryScheme) {
      toast.error("Please fill all fields for adding a beneficiary.");
      return;
    }
    if (!isValidAddress(newBeneficiaryAddress)) {
      toast.error("Invalid beneficiary address format.");
      return;
    }
    const est = await estimateAddGas(newBeneficiaryAddress, newBeneficiaryName, newBeneficiaryScheme);
    if (est) {
      const ok = window.confirm(`Estimated cost: ~${parseFloat(est.costEth).toFixed(6)} ETH. Proceed?`);
      if (!ok) return;
    }
    const success = await addBeneficiary(newBeneficiaryAddress, newBeneficiaryName, newBeneficiaryScheme);
    if (success) {
      setNewBeneficiaryAddress("");
      setNewBeneficiaryName("");
      setNewBeneficiaryScheme("");
    }
  };

  return (
    <Card className="bg-card text-card-foreground border-border shadow-sm animate-fade-in-up delay-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <UserPlus className="h-5 w-5" /> Add New Beneficiary
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-beneficiary-address" className="text-base">Beneficiary Address</Label>
          <Input
            id="new-beneficiary-address"
            placeholder="0x..."
            value={newBeneficiaryAddress}
            onChange={(e) => setNewBeneficiaryAddress(e.target.value)}
            className="bg-muted text-muted-foreground border-border h-10 text-base dark:neon-focus"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-beneficiary-name" className="text-base">Name</Label>
          <Input
            id="new-beneficiary-name"
            placeholder="John Doe"
            value={newBeneficiaryName}
            onChange={(e) => setNewBeneficiaryName(e.target.value)}
            className="bg-muted text-muted-foreground border-border h-10 text-base dark:neon-focus"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-beneficiary-scheme" className="text-base">Scheme</Label>
          <Input
            id="new-beneficiary-scheme"
            placeholder="PM Kisan"
            value={newBeneficiaryScheme}
            onChange={(e) => setNewBeneficiaryScheme(e.target.value)}
            className="bg-muted text-muted-foreground border-border h-10 text-base dark:neon-focus"
          />
        </div>
        <Button onClick={handleAddBeneficiary} disabled={!isConnected || isAddingBeneficiary} className="w-full flex items-center gap-2 h-10 text-base dark:neon-hover">
          {isAddingBeneficiary ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          {isAddingBeneficiary ? "Adding..." : "Add Beneficiary"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AddBeneficiaryCard;
