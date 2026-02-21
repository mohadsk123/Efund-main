"use client";

import { useState, useMemo } from "react";
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
import { DollarSign, Filter, Download, RefreshCw, Loader2, Wallet, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDataApi } from "@/hooks/use-data-api"; // Import the new hook

// Unified Transaction interface for display (matches DisbursementData from use-data-api)
interface DisplayTransaction {
  beneficiaryAddress: string;
  name?: string;
  scheme?: string;
  amount: string;
  timestamp: number;
  hash?: string;
  type?: string;
  status?: "Completed" | "Pending" | "Failed";
}

const Transactions = () => {
  const {
    isAuthenticated,
    disbursements,
    isDisbursementsLoading,
    refetchAllData,
  } = useDataApi();

  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterType, setFilterType] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Since the API only returns completed disbursements, we simulate other types/statuses locally
  // In a real Express app, the backend would aggregate all transaction types.
  const allTransactions: DisplayTransaction[] = useMemo(() => {
    // Assuming all disbursements fetched are 'Completed' and of type 'Disbursement'
    return disbursements.map(d => ({
      ...d,
      type: "Disbursement",
      status: "Completed" as "Completed" | "Pending" | "Failed",
    })).sort((a, b) => b.timestamp - a.timestamp);
  }, [disbursements]);

  const filteredTransactions = allTransactions.filter((t) => {
    // Note: Status filtering is limited as API only returns 'Completed' disbursements
    const matchesStatus = filterStatus === "All" || t.status === filterStatus;
    const matchesType = filterType === "All" || t.type === filterType;
    const matchesSearch =
      (t.name && t.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.scheme && t.scheme.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.beneficiaryAddress && t.beneficiaryAddress.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.hash && t.hash.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesType && matchesSearch;
  });

  const getStatusBadgeVariant = (status: "Completed" | "Pending" | "Failed") => {
    switch (status) {
      case "Completed":
        return "default";
      case "Pending":
        return "secondary";
      case "Failed":
      default:
        return "destructive";
    }
  };

  const handleExport = () => {
    try {
      const headers = ["Type", "Name", "Address", "Scheme", "Amount(ETH)", "Status", "Timestamp", "TxHash"];
      const rows = filteredTransactions.map(t => [
        "Disbursement",
        t.name || "",
        t.beneficiaryAddress || "",
        t.scheme || "",
        t.amount || "",
        "Completed",
        String(t.timestamp),
        t.hash || ""
      ]);
      const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Transactions exported");
    } catch (e) {
      toast.error("Failed to export CSV");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="flex flex-col gap-8 px-6 py-8 animate-fade-in-up">
      <div className="flex items-center gap-3 text-primary">
        <DollarSign className="h-7 w-7" />
        <h2 className="text-4xl font-bold tracking-tight text-foreground">Transactions</h2>
      </div>
      <p className="text-lg text-muted-foreground max-w-2xl">
        View and manage all financial transactions within the system.
      </p>

      {!isAuthenticated ? (
        <Card className="bg-card text-card-foreground border-border shadow-sm p-6 text-center animate-fade-in-up delay-100">
          <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <CardTitle className="text-2xl font-semibold mb-2">User Not Authenticated</CardTitle>
          <p className="text-muted-foreground mb-4">
            Please log in to view transaction history.
          </p>
        </Card>
      ) : (
        <Card className="bg-card text-card-foreground border-border shadow-sm animate-fade-in-up delay-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-semibold">Transaction History</CardTitle>
            <div className="flex gap-2">
              <Button onClick={refetchAllData} variant="outline" className="flex items-center gap-2 h-10 px-4 py-2 text-base dark:neon-hover" disabled={isDisbursementsLoading}>
                {isDisbursementsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Refresh
              </Button>
              <Button onClick={handleExport} variant="outline" className="flex items-center gap-2 h-10 px-4 py-2 text-base dark:neon-hover">
                <Download className="h-4 w-4" /> Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Input
                placeholder="Search by beneficiary, scheme, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 min-w-[200px] bg-muted text-muted-foreground border-border h-10 text-base dark:neon-focus"
              />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px] bg-muted text-muted-foreground border-border h-10 text-base dark:neon-focus">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border-border">
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Pending" disabled>Pending (API)</SelectItem>
                  <SelectItem value="Failed" disabled>Failed (API)</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px] bg-muted text-muted-foreground border-border h-10 text-base dark:neon-focus">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Filter by Type" />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border-border">
                  <SelectItem value="All">All Types</SelectItem>
                  <SelectItem value="Disbursement">Disbursement</SelectItem>
                  <SelectItem value="Send ETH" disabled>Send ETH (API)</SelectItem>
                  <SelectItem value="Deposit to Contract" disabled>Deposit to Contract (API)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="overflow-x-auto rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted hover:bg-muted">
                    <TableHead className="text-muted-foreground font-semibold">Type</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Beneficiary Name</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Address</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Scheme</TableHead>
                    <TableHead className="text-right text-muted-foreground font-semibold">Amount</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Date</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Tx Hash</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isDisbursementsLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" /> Loading transactions...
                      </TableCell>
                    </TableRow>
                  ) : filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction, index) => (
                      <TableRow key={transaction.hash || index} className="hover:bg-accent/50 dark:neon-hover">
                        <TableCell className="font-medium">{transaction.type}</TableCell>
                        <TableCell>{transaction.name || "N/A"}</TableCell>
                        <TableCell className="font-mono text-xs">{transaction.beneficiaryAddress ? `${transaction.beneficiaryAddress.substring(0, 6)}...` : "N/A"}</TableCell>
                        <TableCell>{transaction.scheme || "N/A"}</TableCell>
                        <TableCell className="text-right">Ξ{parseFloat(transaction.amount).toFixed(4)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant("Completed")} className="px-3 py-1 text-sm">
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
                      <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                        No transactions found matching your criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Transactions;
