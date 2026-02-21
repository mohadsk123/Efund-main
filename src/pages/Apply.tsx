"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, FileText, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { useDataApi } from "@/hooks/use-data-api";

const Apply = () => {
  const { schemes, isLoadingSchemes, applyForScheme } = useDataApi();
  const [applyingId, setApplyingId] = useState<number | null>(null);

  const handleApply = async (schemeId: number) => {
    setApplyingId(schemeId);
    await applyForScheme(schemeId);
    setApplyingId(null);
  };

  const activeSchemes = schemes.filter((s) => s.isActive);

  return (
    <div className="flex flex-col gap-8 px-6 py-8 animate-fade-in-up">
      <div className="flex items-center gap-3 text-primary">
        <FileText className="h-7 w-7" />
        <h2 className="text-4xl font-bold tracking-tight text-foreground">Apply for Schemes</h2>
      </div>
      <p className="text-lg text-muted-foreground max-w-2xl">
        View active government schemes and apply directly if you meet the criteria.
      </p>

      {isLoadingSchemes ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeSchemes.length > 0 ? (
            activeSchemes.map((scheme, index) => (
              <Card
                key={scheme.id}
                className="bg-card text-card-foreground border-border shadow-sm flex flex-col dark:neon-hover animate-fade-in-up"
                style={{ animationDelay: `${150 + index * 50}ms` }}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-semibold">{scheme.name}</CardTitle>
                  <CardDescription className="text-muted-foreground line-clamp-2 text-sm">
                    Per Beneficiary: {scheme.amount} ETH • Income &lt; {scheme.maxIncome} ETH
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between pt-0">
                  <div className="mb-4 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Eligibility: Age {scheme.minAge}-{scheme.maxAge} • Income &lt; {scheme.maxIncome} ETH
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 flex items-center gap-2 h-10 text-base dark:neon-hover"
                      onClick={() => handleApply(scheme.id)}
                      disabled={applyingId === scheme.id}
                    >
                      {applyingId === scheme.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="col-span-full bg-card text-card-foreground border-border shadow-sm p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2 text-primary">
                <Info className="h-5 w-5" /> 
                <span className="font-semibold">No Active Schemes Available</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Schemes may not be configured in the current contract mode. You can still register your on-chain profile to be eligible for future schemes.
              </p>
              <Link to="/profile">
                <Button className="h-10 text-base">Go to Beneficiary Profile</Button>
              </Link>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Apply;
