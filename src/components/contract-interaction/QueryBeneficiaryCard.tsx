"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

type BeneficiaryDetails = {
  name?: string;
  scheme?: string;
  approved?: boolean;
  totalReceived?: string;
};

interface QueryBeneficiaryCardProps {
  isConnected: boolean;
  queryBeneficiaryDetails: (address: string) => Promise<void>;
  queriedBeneficiary: BeneficiaryDetails | null;
  isQuerying: boolean;
}

const isValidAddress = (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address);

const QueryBeneficiaryCard = ({
  isConnected,
  queryBeneficiaryDetails,
  queriedBeneficiary,
  isQuerying,
}: QueryBeneficiaryCardProps) => {
  const [queryBeneficiaryAddressInput, setQueryBeneficiaryAddressInput] = useState("");

  const handleQueryBeneficiary = () => {
    if (!isConnected) {
      toast.error("Please log in first.");
      return;
    }
    if (!queryBeneficiaryAddressInput) {
      toast.error("Please enter a beneficiary address to query.");
      return;
    }
    if (!isValidAddress(queryBeneficiaryAddressInput)) {
      toast.error("Invalid beneficiary address format.");
      return;
    }
    queryBeneficiaryDetails(queryBeneficiaryAddressInput);
  };

  return (
    <Card className="bg-card text-card-foreground border-border shadow-sm animate-fade-in-up delay-600">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Search className="h-5 w-5" /> Query Beneficiary Details
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="query-beneficiary-address" className="text-base">Beneficiary Address</Label>
          <Input
            id="query-beneficiary-address"
            placeholder="0x..."
            value={queryBeneficiaryAddressInput}
            onChange={(e) => setQueryBeneficiaryAddressInput(e.target.value)}
            className="bg-muted text-muted-foreground border-border h-10 text-base dark:neon-focus"
          />
        </div>
        <Button onClick={handleQueryBeneficiary} disabled={isQuerying || !isConnected} className="w-full flex items-center gap-2 h-10 text-base dark:neon-hover">
          {isQuerying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {isQuerying ? "Querying..." : "Query Details"}
        </Button>
        {isQuerying && (
          <div className="flex items-center justify-center text-muted-foreground mt-4">
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading beneficiary details...
          </div>
        )}
        {queriedBeneficiary && !isQuerying && (
          <div className="space-y-2 mt-4 p-3 bg-muted rounded-md border border-border dark:neon-hover">
            <p className="text-sm">
              <span className="font-semibold">Name:</span> {queriedBeneficiary.name ?? "N/A"}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Scheme:</span> {queriedBeneficiary.scheme ?? "N/A"}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Approved:</span>{" "}
              <span className={queriedBeneficiary.approved ? "text-green-500" : "text-red-500"}>
                {queriedBeneficiary.approved ? "Yes" : "No"}
              </span>
            </p>
            <p className="text-sm">
              <span className="font-semibold">Total Received:</span>{" "}
              {queriedBeneficiary.totalReceived ? parseFloat(queriedBeneficiary.totalReceived).toFixed(4) : "0.0000"} ETH
            </p>
          </div>
        )}
        {queriedBeneficiary === null && !isQuerying && queryBeneficiaryAddressInput && (
          <p className="text-sm text-muted-foreground">No details found for this address (or address is invalid).</p>
        )}
      </CardContent>
    </Card>
  );
};

export default QueryBeneficiaryCard;
