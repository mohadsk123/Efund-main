"use client";
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
import { Badge } from "@/components/ui/badge";
import { ClipboardList, CheckCircle, Loader2, ExternalLink, Clock } from "lucide-react";
import { useDataApi } from "@/hooks/use-data-api";

const AdminApplications = () => {
  const { allApplications, isLoadingApplications, approveBeneficiary, isApprovingBeneficiary } = useDataApi();

  const handleApprove = async (addressOrEmail: string | undefined, id: string) => {
    if (!addressOrEmail) return;
    await approveBeneficiary(addressOrEmail, id);
  };

  return (
    <div className="flex flex-col gap-8 px-6 py-8 animate-fade-in-up">
      <div className="flex items-center gap-3 text-primary">
        <ClipboardList className="h-7 w-7" />
        <h2 className="text-4xl font-bold tracking-tight text-foreground">Manage Applications</h2>
      </div>
      <p className="text-lg text-muted-foreground max-w-2xl">
        Review and approve scheme applications from beneficiaries. Approving an application triggers a blockchain transaction.
      </p>

      <Card className="bg-card text-card-foreground border-border shadow-sm animate-fade-in-up delay-100">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Pending & Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableHead className="text-muted-foreground font-semibold">Beneficiary Email/Address</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Scheme</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Applied At</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingApplications ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" /> Loading applications...
                    </TableCell>
                  </TableRow>
                ) : allApplications.length > 0 ? (
                  allApplications.map((app) => (
                    <TableRow key={app._id} className="hover:bg-accent/50 dark:neon-hover">
                      <TableCell className="font-mono text-xs">
                        {app.applicantAddress
                          ? app.applicantAddress
                          : app.userEmail}
                      </TableCell>
                      <TableCell className="font-medium">{app.schemeName}</TableCell>
                      <TableCell>
                        <Badge variant={app.status === 'Approved' ? 'default' : 'secondary'}>
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(app.appliedAt).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {app.status === 'Pending' ? (
                          <Button
                            size="sm"
                            className="flex items-center gap-1 h-8 text-xs dark:neon-hover"
                            onClick={() => handleApprove(app.applicantAddress || app.userEmail, app._id)}
                            disabled={isApprovingBeneficiary}
                          >
                            {isApprovingBeneficiary ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                            Mark as Approved
                          </Button>
                        ) : (
                          <a
                            href={`https://sepolia.etherscan.io/tx/${app.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                          >
                            View Tx <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No applications found.
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

export default AdminApplications;
