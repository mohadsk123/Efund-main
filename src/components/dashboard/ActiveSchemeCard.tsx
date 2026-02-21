"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Users, Shield, Target, CheckCircle } from "lucide-react"; // Icons for schemes

interface ActiveSchemeCardProps {
  icon: React.ElementType;
  schemeName: string;
  status: "Active" | "Upcoming" | "Archived";
  allocated: string;
  utilized: string;
  beneficiaries: string;
  utilizationPercentage: number;
  isVerified: boolean;
  className?: string;
}

const ActiveSchemeCard = ({
  icon: Icon,
  schemeName,
  status,
  allocated,
  utilized,
  beneficiaries,
  utilizationPercentage,
  isVerified,
  className,
}: ActiveSchemeCardProps) => {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default";
      case "Upcoming":
        return "secondary";
      case "Archived":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Card className={cn("bg-card text-card-foreground border-border shadow-sm transition-all duration-200 dark:neon-hover", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <CardTitle className="text-lg font-semibold">{schemeName}</CardTitle>
            <Badge variant={getStatusBadgeVariant(status)} className="w-fit mt-1 text-xs">
              {status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Allocated</p>
            <p className="font-semibold text-foreground">{allocated}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Utilized</p>
            <p className="font-semibold text-foreground">{utilized}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Beneficiaries</p>
            <p className="font-semibold text-foreground">{beneficiaries}</p>
          </div>
        </div>
        <div className="space-y-2">
          <Progress value={utilizationPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {utilizationPercentage}% utilized • {isVerified ? "Smart Contract Verified" : "Verification Pending"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveSchemeCard;