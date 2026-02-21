"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, Key, Lock, Activity } from "lucide-react";
import { toast } from "sonner";

const Security = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const handleToggleTwoFactor = (checked: boolean) => {
    setTwoFactorEnabled(checked);
    toast.success(`Two-Factor Authentication ${checked ? "enabled" : "disabled"}.`);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    // Simulate password change
    toast.success("Password changed successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const dummyLoginActivities = [
    { id: "L001", device: "Chrome on Windows", location: "New Delhi, India", time: "2024-10-25 10:30 AM" },
    { id: "L002", device: "Firefox on Linux", location: "Mumbai, India", time: "2024-10-24 03:15 PM" },
    { id: "L003", device: "Safari on iOS", location: "Bengaluru, India", time: "2024-10-23 09:00 AM" },
  ];

  return (
    <div className="flex flex-col gap-8 px-6 py-8 animate-fade-in-up">
      <div className="flex items-center gap-3 text-primary">
        <Shield className="h-7 w-7" />
        <h2 className="text-4xl font-bold tracking-tight text-foreground">Security Settings</h2>
      </div>
      <p className="text-lg text-muted-foreground max-w-2xl">
        Manage your account's security features and review recent activity.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card text-card-foreground border-border shadow-sm animate-fade-in-up delay-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Key className="h-5 w-5" /> Two-Factor Authentication
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Add an extra layer of security to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="two-factor-switch" className="text-base">Enable 2FA</Label>
              <Switch
                id="two-factor-switch"
                checked={twoFactorEnabled}
                onCheckedChange={handleToggleTwoFactor}
                className="dark:neon-hover"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {twoFactorEnabled
                ? "Two-Factor Authentication is currently enabled."
                : "Two-Factor Authentication is currently disabled. Enable for enhanced security."}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground border-border shadow-sm animate-fade-in-up delay-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Lock className="h-5 w-5" /> Change Password
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Update your account password regularly for security.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-base">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-muted text-muted-foreground border-border h-10 text-base dark:neon-focus"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-base">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-muted text-muted-foreground border-border h-10 text-base dark:neon-focus"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password" className="text-base">Confirm New Password</Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="bg-muted text-muted-foreground border-border h-10 text-base dark:neon-focus"
                />
              </div>
              <Button type="submit" className="w-full h-10 text-base dark:neon-hover">
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-card text-card-foreground border-border shadow-sm animate-fade-in-up delay-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5" /> Recent Login Activity
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Review where and when your account has been accessed.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {dummyLoginActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-muted rounded-md border border-border dark:neon-hover">
                  <div>
                    <p className="font-medium text-sm">{activity.device}</p>
                    <p className="text-xs text-muted-foreground">{activity.location}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Security;