"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ListChecks, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DisbursementData {
  beneficiaryAddress: string;
  name?: string;
  scheme?: string;
  amount: string;
  timestamp: number;
  hash?: string;
}

interface RecentDisbursementsTableProps {
  isConnected: boolean;
  disbursements: DisbursementData[];
  isDisbursementsLoading: boolean;
}

const RecentDisbursementsTable = ({
  isConnected,
  disbursements,
  isDisbursementsLoading,
}: RecentDisbursementsTableProps) => {
  const recentDisbursements = disbursements.slice(0, 5);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <Card className="lg:col-span-2 bg-card text-card-foreground border-border shadow-sm animate-fade-in-up delay-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <ListChecks className="h-5 w-5" /> Recent Disbursements
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted hover:bg-muted">
                <TableHead className="text-muted-foreground font-semibold">Beneficiary Name</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Scheme</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Address</TableHead>
                <TableHead className="text-right text-muted-foreground font-semibold">Amount</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isDisbursementsLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" /> Loading disbursements...
                  </TableCell>
                </TableRow>
              ) : recentDisbursements.length > 0 ? (
                recentDisbursements.map((disbursement, index) => (
                  <TableRow key={disbursement.hash || index} className="hover:bg-accent/50 dark:neon-hover">
                    <TableCell className="font-medium">{disbursement.name ?? "N/A"}</TableCell>
                    <TableCell>{disbursement.scheme ?? "N/A"}</TableCell>
                    <TableCell className="font-mono text-xs">{disbursement.beneficiaryAddress.substring(0, 6)}...</TableCell>
                    <TableCell className="text-right">{parseFloat(disbursement.amount).toFixed(4)} ETH</TableCell>
                    <TableCell>{formatDate(disbursement.timestamp)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No disbursements recorded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {disbursements.length > 5 && (
          <div className="text-center mt-4">
            <Button variant="link" onClick={() => toast.info("Navigating to full transactions list...")}>
              View All Disbursements
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentDisbursementsTable;
