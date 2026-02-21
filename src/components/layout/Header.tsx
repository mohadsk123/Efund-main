"use client";

import { Search, LogIn, LogOut, Loader2, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import AdminWalletStatus from "@/components/AdminWalletStatus";
import Logo from "@/components/Logo";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import logoUrl from "@/assets/logo-efund.svg";

const Header = () => {
  const { session, loading, logout } = useAuth();
  const isLoggedIn = session !== null;

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-border bg-background text-foreground shadow-md dark:shadow-background/20">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Logo
            src={logoUrl}
            appName="E-Fund System"
            iconClassName="h-8 w-8"
            appNameClassName="text-xl font-bold text-primary"
          />
          <div className="hidden lg:flex items-center gap-2 ml-4">
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 flex items-center gap-1 px-2 py-0.5">
              <Activity className="h-3 w-3 animate-pulse" />
              Blockchain Live
            </Badge>
            <span className="text-xs text-muted-foreground">
              • Sepolia Network
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-9 pr-3 h-9 w-[200px] bg-muted text-muted-foreground border-border dark:neon-focus"
          />
        </div>
        <NotificationBell />
        <ThemeToggle />
        
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        ) : isLoggedIn ? (
          <AdminWalletStatus />
        ) : (
          <Link to="/auth">
            <Button className="px-4 py-2 flex items-center gap-2 dark:neon-hover">
              <LogIn className="h-4 w-4" /> Login
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
