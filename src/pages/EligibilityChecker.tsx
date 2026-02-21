"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Wallet, CheckCircle, XCircle, ChevronDown, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useDataApi } from "@/hooks/use-data-api";

const EligibilityChecker = () => {
  const { isAuthenticated, queryBeneficiaryDetails } = useDataApi();
  const [walletAddressInput, setWalletAddressInput] = useState("");
  const [checkedAddress, setCheckedAddress] = useState<string | null>(null);
  type QueriedDetails = { name?: string; scheme?: string; approved?: boolean; totalReceived?: string } | null;
  const [queriedDetails, setQueriedDetails] = useState<QueriedDetails>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(true);

  const isValidAddress = (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address);

  const handleCheckEligibility = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to check eligibility.");
      return;
    }
    if (!walletAddressInput || !isValidAddress(walletAddressInput)) {
      toast.error("Please enter a valid Ethereum wallet address.");
      return;
    }

    setIsQuerying(true);
    setCheckedAddress(walletAddressInput);
    setQueriedDetails(null);

    try {
      const details = await queryBeneficiaryDetails(walletAddressInput);
      setQueriedDetails(details);
      if (details) {
        toast.success(`Details found for ${details.name || "beneficiary"}.`);
      } else {
        toast.info("Beneficiary not found in the system.");
      }
    } catch (error) {
      // Error handling is done inside useDataApi, but we catch here to stop loading
      setQueriedDetails(null);
    } finally {
      setIsQuerying(false);
    }
  };

  const handleCopyAddress = () => {
    if (checkedAddress) {
      navigator.clipboard.writeText(checkedAddress);
      toast.info("Wallet address copied to clipboard!");
    }
  };

  const isEligible = queriedDetails?.approved === true;
  const totalReceived = queriedDetails?.totalReceived ? parseFloat(queriedDetails.totalReceived).toFixed(4) : "0.0000";

  return (
    <div className="flex flex-col gap-8 px-6 py-8 animate-fade-in-up">
      <div className="flex items-center gap-3 text-primary">
        <CheckCircle className="h-7 w-7" />
        <h2 className="text-4xl font-bold tracking-tight text-foreground">Scheme Eligibility</h2>
      </div>
      <p className="text-lg text-muted-foreground max-w-2xl">
        Check if a specific wallet address is registered and approved for fund disbursement.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-100">
        <Input
          type="text"
          placeholder="Enter beneficiary wallet address (0x...)"
          value={walletAddressInput}
          onChange={(e) => setWalletAddressInput(e.target.value)}
          className="flex-1 bg-card text-card-foreground border-border h-11 text-base dark:neon-focus"
          disabled={isQuerying || !isAuthenticated}
        />
        <Button onClick={handleCheckEligibility} className="flex items-center gap-2 px-6 py-2 h-11 text-base dark:neon-hover" disabled={isQuerying || !isAuthenticated}>
          {isQuerying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check Eligibility"}
          <span className="text-xl">→</span>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {checkedAddress && (
          <Card className="bg-card text-card-foreground border-border shadow-sm animate-fade-in-up delay-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Wallet className="h-5 w-5" /> Eligibility Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="flex items-center justify-between p-3 bg-muted rounded-md border border-border dark:neon-hover">
                <span className="font-mono text-sm text-muted-foreground truncate">{checkedAddress}</span>
                <Button variant="ghost" size="icon" onClick={handleCopyAddress} className="h-8 w-8">
                  <Copy className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
              
              {isQuerying ? (
                <div className="flex items-center justify-center h-20 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Fetching contract data...
                </div>
              ) : queriedDetails ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span>Approval Status</span>
                    </div>
                    {isEligible ? (
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600 px-3 py-1 text-sm flex items-center gap-1">
                        Approved <CheckCircle className="h-3 w-3" />
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="flex items-center gap-1 px-3 py-1 text-sm">
                        Not Approved <XCircle className="h-3 w-3" />
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Name:</span>
                    </div>
                    <span className="text-sm font-medium">{queriedDetails.name || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Scheme:</span>
                    </div>
                    <span className="text-sm font-medium">{queriedDetails.scheme || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Total Funds Received:</span>
                    </div>
                    <span className="text-sm font-medium">{totalReceived} ETH</span>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground p-4 border border-dashed rounded-md">
                  Enter an address above to check its status.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Collapsible
          open={isCollapsibleOpen}
          onOpenChange={setIsCollapsibleOpen}
          className="bg-card text-card-foreground border-border rounded-lg shadow-sm animate-fade-in-up delay-300"
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-pointer collapsible-trigger dark:neon-hover">
              <CardTitle className="text-xl font-semibold">How Does Eligibility Work?</CardTitle>
              <ChevronDown
                className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                  isCollapsibleOpen ? "rotate-180" : ""
                }`}
              />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 text-base text-muted-foreground pt-0">
              <ol className="list-decimal list-inside space-y-3">
                <li>
                  <span className="font-semibold text-foreground">Registration</span>
                  <p className="ml-4 text-sm">An administrator uses the 'Beneficiaries' page or 'Contract Interact' page to register a wallet address with a name and scheme via the smart contract.</p>
                </li>
                <li>
                  <span className="font-semibold text-foreground">Approval</span>
                  <p className="ml-4 text-sm">The administrator must explicitly approve the beneficiary's address on the smart contract before funds can be disbursed.</p>
                </li>
                <li>
                  <span className="font-semibold text-foreground">Disbursement Check</span>
                  <p className="ml-4 text-sm">This tool queries the smart contract directly via the backend API to verify the approval status and total funds received by the address.</p>
                </li>
              </ol>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default EligibilityChecker;
