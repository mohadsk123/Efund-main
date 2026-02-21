"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, User, Bell, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

const Settings = () => {
  const { session, logout } = useAuth();
  const [userName, setUserName] = useState("John Doe");
  const [userEmail, setUserEmail] = useState("john.doe@example.com");
  const [receiveEmailNotifications, setReceiveEmailNotifications] = useState(true);
  const [receivePushNotifications, setReceivePushNotifications] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile settings saved!");
  };

  const handleNotificationToggle = (type: string, checked: boolean) => {
    if (type === "email") {
      setReceiveEmailNotifications(checked);
      toast.success(`Email notifications ${checked ? "enabled" : "disabled"}.`);
    } else if (type === "push") {
      setReceivePushNotifications(checked);
      toast.success(`Push notifications ${checked ? "enabled" : "disabled"}.`);
    }
  };

  return (
    <div className="flex flex-col gap-8 px-6 py-8 animate-fade-in-up">
      <div className="flex items-center gap-3 text-primary">
        <SettingsIcon className="h-7 w-7" />
        <h2 className="text-4xl font-bold tracking-tight text-foreground">Settings</h2>
      </div>
      <p className="text-lg text-muted-foreground max-w-2xl">
        Manage your account preferences, profile information, and notification settings.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card text-card-foreground border-border shadow-sm animate-fade-in-up delay-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <User className="h-5 w-5" /> Profile Settings
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Update your personal information.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-name" className="text-base">Full Name</Label>
                <Input
                  id="user-name"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="bg-muted text-muted-foreground border-border h-10 text-base dark:neon-focus"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-email" className="text-base">Email Address</Label>
                <Input
                  id="user-email"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="bg-muted text-muted-foreground border-border h-10 text-base dark:neon-focus"
                />
              </div>
              <Button type="submit" className="w-full h-10 text-base dark:neon-hover">
                Save Profile
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground border-border shadow-sm animate-fade-in-up delay-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5" /> Notification Settings
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Control how you receive notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
              <Switch
                id="email-notifications"
                checked={receiveEmailNotifications}
                onCheckedChange={(checked) => handleNotificationToggle("email", checked)}
                className="dark:neon-hover"
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="push-notifications" className="text-base">Push Notifications</Label>
              <Switch
                id="push-notifications"
                checked={receivePushNotifications}
                onCheckedChange={(checked) => handleNotificationToggle("push", checked)}
                className="dark:neon-hover"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground border-border shadow-sm animate-fade-in-up delay-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <LogOut className="h-5 w-5" /> Account
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Signed in as {session?.email?.substring(0, 30) || "User"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button onClick={logout} variant="destructive" className="w-full h-10 text-base dark:neon-hover">
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
