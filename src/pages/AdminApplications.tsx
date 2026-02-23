"use client";
import React, { useState } from "react";
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
import { ClipboardList, CheckCircle, Loader2, ExternalLink, Clock, XCircle } from "lucide-react";
import { useDataApi } from "@/hooks/use-data-api";

const AdminApplications = () => {
  const { allApplications, isLoadingApplications, approveBeneficiary, isApprovingBeneficiary, queryBeneficiaryDetails, bulkUpdateApplications } = useDataApi();
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setSelected(s => ({ ...s, [id]: !s[id] }));
  const selectedIds = Object.keys(selected).filter(id => selected[id]);
  const [detailsMap, setDetailsMap] = useState<Record<string, { name?: string; scheme?: string; approved?: boolean; totalReceived?: string } | null>>({});
  const viewDetails = async (appId: string, address?: string) => {
    if (!address) return;
    const d = await queryBeneficiaryDetails(address);
    setDetailsMap(m => ({ ...m, [appId]: d }));
  };

  const handleApprove = async (addressOrEmail: string | undefined, id: string) => {
    if (!addressOrEmail) return;
    await approveBeneficiary(addressOrEmail, id);
  };
  const bulkApprove = async () => {
    const ids = selectedIds;
    if (ids.length === 0) return;
    await bulkUpdateApplications(ids, "approve");
    setSelected({});
  };
  const bulkReject = async () => {
    const ids = selectedIds;
    if (ids.length === 0) return;
    await bulkUpdateApplications(ids, "reject");
    setSelected({});
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
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <Button size="sm" className="h-8" onClick={bulkApprove} disabled={isApprovingBeneficiary}>
                <CheckCircle className="h-3 w-3 mr-1" /> Approve Selected
              </Button>
              <Button size="sm" variant="destructive" className="h-8" onClick={bulkReject} disabled={isApprovingBeneficiary}>
                <XCircle className="h-3 w-3 mr-1" /> Reject Selected
              </Button>
            </div>
          )}
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableHead className="text-muted-foreground font-semibold">Select</TableHead>
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
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" /> Loading applications...
                    </TableCell>
                  </TableRow>
                ) : allApplications.length > 0 ? (
                  allApplications.map((app) => (
                    <TableRow key={app._id} className="hover:bg-accent/50 dark:neon-hover">
                      <TableCell>
                        <input type="checkbox" checked={!!selected[app._id]} onChange={() => toggle(app._id)} />
                      </TableCell>
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
                        <Button
                          size="sm"
                          variant="outline"
                          className="ml-2 h-8 text-xs"
                          onClick={() => viewDetails(app._id, app.applicantAddress || undefined)}
                        >
                          View Details
                        </Button>
                        {detailsMap[app._id] && (
                          <div className="mt-2 text-[11px] text-muted-foreground">
                            <div>Name: {detailsMap[app._id]?.name || 'N/A'}</div>
                            <div>Total Received: {detailsMap[app._id]?.totalReceived || '0'}</div>
                            <div>Approved: {detailsMap[app._id]?.approved ? 'Yes' : 'No'}</div>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
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
