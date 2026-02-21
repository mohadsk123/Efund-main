"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils"; // Import cn for className merging

interface SchemeData {
  name: string;
  beneficiaries: number;
}

const dummySchemeData: SchemeData[] = [
  { name: "PM Kisan", beneficiaries: 4000 },
  { name: "Ayushman Bharat", beneficiaries: 3000 },
  { name: "Jal Jeevan", beneficiaries: 2000 },
  { name: "MGNREGA", beneficiaries: 2780 },
  { name: "PM Awas", beneficiaries: 1890 },
  { name: "Swachh Bharat", beneficiaries: 2390 },
  { name: "Skill India", beneficiaries: 3490 },
];

interface SchemesOverviewChartProps {
  className?: string;
}

const SchemesOverviewChart = ({ className }: SchemesOverviewChartProps) => {
  return (
    <Card className={cn("col-span-full lg:col-span-3 bg-card text-card-foreground border-border shadow-sm transition-all duration-200", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Schemes Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dummySchemeData}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 5,
              }}
            >
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
                itemStyle={{ color: "hsl(var(--card-foreground))" }}
              />
              <Bar dataKey="beneficiaries" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SchemesOverviewChart;