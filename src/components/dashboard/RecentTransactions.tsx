"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Loader2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useDataApi } from "@/hooks/use-data-api"; // Import the new hook

// Unified Transaction interface for display (matches DisbursementData from use-data-api)
interface DisplayTransaction {
  beneficiaryAddress: string;
  name: string;
  scheme: string;
  amount: string;
  timestamp: number;
  hash?: string;
}

const getStatusBadgeVariant = (status: "Completed" | "Pending" | "Failed") => {
  switch (status) {
    case "Completed":
      return "default";
    case "Pending":
      return "secondary";
    case "Failed":
      return "destructive";
    default:
      return "secondary";
  }
};

interface RecentTransactionsProps {
  className?: string;
}

const RecentTransactions = ({ className }: RecentTransactionsProps) => {
  const {
    isAuthenticated,
    disbursements,
    isDisbursementsLoading,
    refetchAllData,
  } = useDataApi();

  // Sort by date (most recent first) and take top 5 for recent transactions
  const recentTransactions = disbursements
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  // Helper function to format timestamp to date string
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <Card className={cn("col-span-full lg:col-span-4 bg-card text-card-foreground border-border shadow-sm transition-all duration-200", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
        <Link to="/transactions" className="text-primary hover:underline p-0 h-auto">
          View All <span className="ml-1 text-xl">→</span>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Beneficiary</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Tx Hash</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isDisbursementsLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" /> Loading transactions...
                  </TableCell>
                </TableRow>
              ) : recentTransactions.length > 0 ? (
                recentTransactions.map((transaction, index) => (
                  <TableRow key={transaction.hash || index} className="hover:bg-accent/50 dark:neon-hover">
                    <TableCell className="font-medium">{transaction.scheme || "Disbursement"}</TableCell>
                    <TableCell>{transaction.name || transaction.beneficiaryAddress?.substring(0, 6) + "..." || "N/A"}</TableCell>
                    <TableCell className="text-right">Ξ{parseFloat(transaction.amount).toFixed(4)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant("Completed")}>
                        Completed
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(transaction.timestamp)}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {transaction.hash ? (
                        <a
                          href={`https://sepolia.etherscan.io/tx/${transaction.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-500 hover:underline"
                        >
                          {transaction.hash.substring(0, 6)}...
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No recent transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;