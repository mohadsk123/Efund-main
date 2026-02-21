"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, PlusSquare, Code } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  return (
    <div className="flex flex-col gap-8 px-6 py-8 animate-fade-in-up">
      <div className="flex items-center gap-3 text-primary">
        <Code className="h-7 w-7" />
        <h2 className="text-4xl font-bold tracking-tight text-foreground">Admin</h2>
      </div>
      <p className="text-lg text-muted-foreground max-w-2xl">
        Manage schemes, monitor applications, and interact with the contract.
      </p>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-card text-card-foreground border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PlusSquare className="h-5 w-5" /> Schemes</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Link to="/admin-schemes">
              <Button className="dark:neon-hover">Open</Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5" /> Applications</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Link to="/admin-applications">
              <Button className="dark:neon-hover">Open</Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Code className="h-5 w-5" /> Contract</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Link to="/contract-interaction">
              <Button className="dark:neon-hover">Open</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
