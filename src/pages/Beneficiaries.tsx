"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Loader2, Mail, ExternalLink, Copy } from "lucide-react";
import { useDataApi } from "@/hooks/use-data-api";

const Beneficiaries = () => {
  const {
    beneficiaries,
    isLoadingBeneficiaries,
    refetchAllData,
  } = useDataApi();

  const [searchTerm, setSearchTerm] = useState("");

  const filteredBeneficiaries = beneficiaries.filter(
    (b) =>
      b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.walletAddress && b.walletAddress.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-8 px-6 py-8 animate-fade-in-up">
      <div className="flex items-center gap-3 text-primary">
        <Users className="h-7 w-7" />
        <h2 className="text-4xl font-bold tracking-tight text-foreground">Beneficiaries</h2>
      </div>
      <p className="text-lg text-muted-foreground max-w-2xl">
        Manage and view details of all registered beneficiaries. These are users who have created accounts in the system.
      </p>

      <Card className="bg-card text-card-foreground border-border shadow-sm animate-fade-in-up delay-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Registered Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-6">
            <Input
              placeholder="Search by email or wallet address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[200px] bg-muted text-muted-foreground border-border h-10 text-base dark:neon-focus"
            />
            <Button variant="outline" size="icon" onClick={refetchAllData} className="h-10 w-10 dark:neon-hover" title="Refresh">
              <Search className="h-5 w-5" />
            </Button>
          </div>
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableHead className="text-muted-foreground font-semibold">Email / ID</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Wallet Address</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Joined Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingBeneficiaries ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" /> Loading beneficiaries...
                    </TableCell>
                  </TableRow>
                ) : filteredBeneficiaries.length > 0 ? (
                  filteredBeneficiaries.map((beneficiary) => (
                    <TableRow key={beneficiary._id} className="hover:bg-accent/50 dark:neon-hover">
                      <TableCell className="font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {beneficiary.email}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {beneficiary.walletAddress ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={`https://sepolia.etherscan.io/address/${beneficiary.walletAddress}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                              title={beneficiary.walletAddress}
                            >
                              {`${beneficiary.walletAddress.substring(0, 10)}...${beneficiary.walletAddress.substring(beneficiary.walletAddress.length - 4)}`}
                            </a>
                            <button
                              className="text-xs text-muted-foreground hover:text-foreground"
                              onClick={() => navigator.clipboard?.writeText(beneficiary.walletAddress!)}
                              title="Copy address"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                            <a
                              href={`https://sepolia.etherscan.io/address/${beneficiary.walletAddress}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open in Etherscan"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">No wallet linked</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="px-3 py-1 text-sm">
                          Registered
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(beneficiary.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No beneficiaries found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Beneficiaries;
