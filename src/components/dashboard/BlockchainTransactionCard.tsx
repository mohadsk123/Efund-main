"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, Info, XCircle, Loader2 } from "lucide-react"; // Icons for transaction status
import { formatDistanceToNowStrict } from "date-fns"; // For relative time formatting

interface BlockchainTransactionCardProps {
  txId: string;
  status: "Completed" | "Pending" | "Processing" | "Failed";
  schemeBeneficiary: string;
  amount: string;
  timestamp: number; // Changed to timestamp (seconds)
  hash?: string; // Made transaction hash optional
  className?: string;
}

const BlockchainTransactionCard = ({
  txId,
  status,
  schemeBeneficiary,
  amount,
  timestamp,
  hash,
  className,
}: BlockchainTransactionCardProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "Pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "Processing":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />; // Use Loader2 for processing
      case "Failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Completed":
        return "default"; // Greenish
      case "Pending":
        return "secondary"; // Yellowish/Muted
      case "Processing":
        return "outline"; // Blueish/Muted
      case "Failed":
        return "destructive"; // Red
      default:
        return "secondary";
    }
  };

  const timeAgo = formatDistanceToNowStrict(new Date(timestamp * 1000), { addSuffix: true });

  return (
    <Card className={cn("bg-card text-card-foreground border-border shadow-sm transition-all duration-200 dark:neon-hover", className)}>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          {getStatusIcon(status)}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{txId}</span>
              <Badge variant={getStatusBadgeVariant(status)} className="text-xs">
                {status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{schemeBeneficiary}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-semibold text-foreground">{amount}</span>
          <span className="text-xs text-muted-foreground mt-1">
            {timeAgo}
            {hash && ( // Only show link if hash is present
              <a
                href={`https://sepolia.etherscan.io/tx/${hash}`} // Assuming Sepolia for now
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-blue-500 hover:underline"
              >
                (View Tx)
              </a>
            )}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlockchainTransactionCard;