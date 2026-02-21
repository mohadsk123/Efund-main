"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type AdminUser = {
  _id: string;
  email: string;
  walletAddress?: string;
  role: "user" | "admin";
  createdAt: string;
};

const AdminUsers = () => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/api/admin/users`, {
          headers: { Authorization: `Bearer ${session?.token}` },
        });
        if (resp.ok) {
          const data = await resp.json();
          setUsers(data);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [session?.token]);

  return (
    <div className="flex flex-col gap-8 px-6 py-8 animate-fade-in-up">
      <div className="flex items-center gap-3 text-primary">
        <Users className="h-7 w-7" />
        <h2 className="text-4xl font-bold tracking-tight text-foreground">Users</h2>
      </div>
      <p className="text-lg text-muted-foreground max-w-2xl">
        View all registered users. Admin privileges are controlled by server configuration for security.
      </p>

      <Card className="bg-card text-card-foreground border-border shadow-sm">
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Wallet</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u._id}>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.walletAddress || "—"}</TableCell>
                      <TableCell className={u.role === "admin" ? "text-green-500" : ""}>{u.role}</TableCell>
                      <TableCell>{new Date(u.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
