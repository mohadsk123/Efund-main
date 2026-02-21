"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OverviewCard from "@/components/dashboard/OverviewCard";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart as BarChartIcon, Loader2 } from "lucide-react";
import { useDataApi } from "@/hooks/use-data-api";

const Analytics = () => {
  const { disbursements, isDisbursementsLoading, schemes, globalStats } = useDataApi();
  const totalDisbursed = useMemo(() => disbursements.reduce((sum, d) => sum + Number(d.amount || 0), 0), [disbursements]);

  // Process real data for the Line Chart (Funds over time)
  const fundsData = useMemo(() => {
    if (disbursements.length === 0) {
      return [
        { name: "Jan", funds: 0 },
        { name: "Feb", funds: 0 },
        { name: "Mar", funds: 0 },
        { name: "Apr", funds: 0 },
        { name: "May", funds: 0 },
        { name: "Jun", funds: 0 },
      ];
    }

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyTotals: Record<string, number> = {};

    disbursements.forEach((d) => {
      const date = new Date(d.timestamp * 1000);
      const month = months[date.getMonth()];
      monthlyTotals[month] = (monthlyTotals[month] || 0) + parseFloat(d.amount);
    });

    return months.map(m => ({
      name: m,
      funds: monthlyTotals[m] || 0
    })).filter((_, i) => i <= new Date().getMonth());
  }, [disbursements]);

  // Process real data for the Bar Chart (Volume by Scheme)
  const transactionTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    
    disbursements.forEach((d) => {
      const schemeName = d.scheme || "Unknown Scheme";
      counts[schemeName] = (counts[schemeName] || 0) + 1;
    });

    const data = Object.entries(counts).map(([name, count]) => ({
      name,
      count
    }));

    // If no real data, show schemes with 0 count to keep the UI clean
    if (data.length === 0 && schemes.length > 0) {
      return schemes.slice(0, 5).map(s => ({ name: s.name, count: 0 }));
    }

    return data.length > 0 ? data : [
      { name: "PM Kisan", count: 0 },
      { name: "Ayushman Bharat", count: 0 },
      { name: "Jal Jeevan", count: 0 },
    ];
  }, [disbursements, schemes]);

  return (
    <div className="flex flex-col gap-8 px-6 py-8 animate-fade-in-up">
      <div className="flex items-center gap-3 text-primary">
        <BarChartIcon className="h-7 w-7" />
        <h2 className="text-4xl font-bold tracking-tight text-foreground">Analytics Dashboard</h2>
      </div>
      <p className="text-lg text-muted-foreground max-w-2xl">
        Real-time insights derived directly from the blockchain ledger.
      </p>

      <div className="grid gap-6 lg:grid-cols-4">
        <OverviewCard title="Contract Balance" value={`Ξ${Number(globalStats?.contractBalance || 0).toFixed(4)}`} description="On-chain balance" />
        <OverviewCard title="Total Disbursed" value={`Ξ${totalDisbursed.toFixed(4)}`} description="Sum of disbursements" />
        <OverviewCard title="Active Schemes" value={`${schemes.length}`} description="Available to apply" />
        <OverviewCard title="Beneficiaries" value={`${globalStats?.totalApprovedBeneficiaries ?? 0}`} description="Registered users" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card text-card-foreground border-border shadow-sm animate-fade-in-up delay-100 dark:neon-hover">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold">Funds Disbursed (ETH)</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[350px] flex items-center justify-center">
              {isDisbursementsLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={fundsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        color: "hsl(var(--card-foreground))",
                      }}
                    />
                    <Line type="monotone" dataKey="funds" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground border-border shadow-sm animate-fade-in-up delay-200 dark:neon-hover">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold">Transaction Count by Scheme</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[350px] flex items-center justify-center">
              {isDisbursementsLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={transactionTypeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--accent))" }}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        color: "hsl(var(--card-foreground))",
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
