"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Mail, ShieldCheck, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth"; // Import useAuth hook
import { useNavigate, useSearchParams } from "react-router-dom";

const AuthForm = ({ mode = "user" }: { mode?: "admin" | "user" }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, register, loginWithWallet } = useAuth();
  const navigate = useNavigate();
  const [_, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (mode === "admin") {
      setIsLogin(true);
    }
  }, [mode]);

  const toggleAdminMode = () => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (mode === 'admin') newParams.delete('mode');
      else newParams.set('mode', 'admin');
      return newParams;
    });
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    let success = false;

    if (isLogin) {
      success = await login(email, password);
      if (success) {
        navigate(mode === "admin" ? "/admin" : "/", { replace: true });
      }
    } else {
      success = await register(email, password);
      if (success) {
        // Switch to login view after successful registration
        setIsLogin(true);
      }
    }
    setIsLoading(false);
  };

  const handleWalletLogin = async () => {
    setIsLoading(true);
    const success = await loginWithWallet();
    
    if (success) {
        const stored = localStorage.getItem("efund_session");
        if (stored) {
            const sess = JSON.parse(stored);
            if (mode === 'admin' && sess?.role !== 'admin') {
                toast.error("Access denied: Not an admin wallet");
                navigate("/", { replace: true });
            } else if (sess?.role === 'admin') {
                navigate("/admin", { replace: true });
            } else {
                navigate("/", { replace: true });
            }
        } else {
            navigate("/", { replace: true });
        }
    }
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md bg-card text-card-foreground border-border shadow-lg dark:shadow-neon-glow/20 animate-fade-in-up">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">
          {mode === "admin" ? "Admin Sign In" : isLogin ? "Welcome Back" : "Join E-Fund System"}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {mode === "admin" ? "Use your admin wallet or credentials" : isLogin ? "Sign in to your account" : "Create a new account"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-muted text-muted-foreground border-border h-10 text-base dark:neon-focus"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-muted text-muted-foreground border-border h-10 text-base dark:neon-focus"
            />
          </div>
          <Button type="submit" className="w-full flex items-center gap-2 h-10 text-base dark:neon-hover" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            {isLoading
              ? (isLogin ? "Logging In..." : "Registering...")
              : mode === "admin"
              ? "Login with Email"
              : isLogin
              ? "Login with Email"
              : "Register with Email"}
          </Button>
        </form>

        <div className="relative">
          <Separator className="my-8" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
            OR
          </span>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full flex items-center gap-2 h-10 text-base dark:neon-hover"
            onClick={handleWalletLogin}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
            {mode === "admin" ? "Login with Wallet" : isLogin ? "Login with Wallet" : "Register with Wallet"}
          </Button>
          <Button
            variant="outline"
            className="w-full flex items-center gap-2 h-10 text-base dark:neon-hover"
            onClick={toggleAdminMode}
            disabled={isLoading}
          >
            <ShieldCheck className="h-4 w-4" />
            {mode === "admin" ? "Login as User" : "Login as Admin"}
          </Button>
        </div>

        {mode !== "admin" && (
          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="p-0 h-auto text-primary hover:underline">
              {isLogin ? "Sign Up" : "Login"}
            </Button>
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthForm;
