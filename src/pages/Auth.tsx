"use client";

import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthForm from "@/components/auth/AuthForm";
import Logo from "@/components/Logo";
import { useAuth } from "@/hooks/use-auth";

const Auth = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const adminMode = searchParams.get("mode") === "admin";

  useEffect(() => {
    // If the user is already logged in, redirect them to the dashboard
    if (session && !loading) {
      navigate(adminMode || session.role === "admin" ? "/admin" : "/", { replace: true });
    }
  }, [session, loading, navigate, adminMode]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4 animate-fade-in">
      <div className="mb-8 text-center">
        <Logo
          appName={adminMode ? "E-Fund Admin" : "E-Fund System"}
          iconClassName="h-12 w-12 mx-auto text-primary"
          appNameClassName="text-4xl font-bold text-foreground mt-2"
          containerClassName="flex-col"
        />
        <p className="text-lg text-muted-foreground mt-2">
          {adminMode ? "Administrator access" : "Blockchain-powered government fund distribution"}
        </p>
      </div>
      <AuthForm mode={adminMode ? "admin" : "user"} />
    </div>
  );
};

export default Auth;
