"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface OverviewCardProps {
  title: string;
  value: string;
  description: string;
  icon?: React.ReactNode;
  className?: string; // Added className prop
}

const OverviewCard = ({ title, value, description, icon, className }: OverviewCardProps) => {
  return (
    <Card className={cn("bg-card text-card-foreground border-border shadow-sm transition-all duration-200", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-primary">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
};

export default OverviewCard;