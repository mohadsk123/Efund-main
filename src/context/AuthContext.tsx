import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";
import { ethers } from "ethers";

interface UserSession {
  id: string;
  email: string;
  token: string;
  role: "user" | "admin";
  walletAddress?: string | null;
}

interface AuthContextType {
  session: UserSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithWallet: () => Promise<boolean>;
  connectWallet: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  const validateSession = useCallback(async (token: string) => {
    try {
      const res = await apiClient.get("/auth/validate", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSession({ id: res.data.id, email: res.data.email, token, role: res.data.role || "user", walletAddress: res.data.walletAddress || null });
      return true;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 403) {
        localStorage.removeItem("efund_session");
        setSession(null);
      } else {
        const message = (err as { message?: string })?.message;
        console.warn("Session validation soft-failed; preserving session.", message || String(err));
      }
      return false;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedSession = localStorage.getItem("efund_session");
      if (storedSession) {
        try {
          const parsedSession: UserSession = JSON.parse(storedSession);
          if (parsedSession && parsedSession.token) {
            await validateSession(parsedSession.token);
          } else {
            localStorage.removeItem("efund_session");
          }
        } catch (e) {
          console.error("Failed to parse stored session", e);
          localStorage.removeItem("efund_session");
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [validateSession]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const normEmail = String(email).trim().toLowerCase();
      if (!normEmail || !password) {
        toast.error("Email and password are required");
        return false;
      }
      const res = await apiClient.post("/auth/login", {
        email: normEmail,
        password,
      });
      const newSession: UserSession = { id: res.data.id, email: res.data.email, token: res.data.token, role: res.data.role || "user", walletAddress: res.data.walletAddress || null };
      localStorage.setItem("efund_session", JSON.stringify(newSession));
      setSession(newSession);
      toast.success("Login successful");
      return true;
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || (err as { message?: string })?.message || "Login failed";
      toast.error(message);
      setSession(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setLoading(true);
    try {
      const normEmail = String(email).trim().toLowerCase();
      if (!normEmail || !password) {
        toast.error("Email and password are required");
        return false;
      }
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return false;
      }
      await apiClient.post("/auth/register", {
        email: normEmail,
        password,
      });
      toast.success("Registration successful! Please log in.");
      return true;
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || (err as { message?: string })?.message || "Registration failed";
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    toast.error("Google login not implemented yet");
    return false;
  };

  const loginWithWallet = async () => {
    setLoading(true);
    try {
      if (!window.ethereum) {
        toast.error("MetaMask not installed. Please install it to connect your wallet.");
        return false;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []); // Request account access
      if (accounts.length === 0) {
        toast.error("No accounts connected.");
        return false;
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const message = "Login to E-Fund System";
      const signature = await signer.signMessage(message);

      const res = await apiClient.post("/auth/wallet-login", {
        address,
        signature,
      });

      const newSession: UserSession = { id: res.data.id, email: res.data.email, token: res.data.token, role: res.data.role || "user", walletAddress: res.data.walletAddress || null };
      localStorage.setItem("efund_session", JSON.stringify(newSession));
      setSession(newSession);
      toast.success("Wallet login successful");
      return true;
    } catch (err: unknown) {
      console.error("Wallet login failed:", err);
      const message = (err as { message?: string })?.message || "Wallet login failed.";
      toast.error(message);
      setSession(null);
      return false;
    } finally {
      setLoading(false);
    }
  };
  const connectWallet = async () => {
    setLoading(true);
    try {
      if (!window.ethereum) {
        toast.error("MetaMask not installed.");
        return false;
      }
      if (!session?.token) {
        toast.error("Please login first.");
        return false;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const signature = await signer.signMessage("Connect Wallet to E-Fund");
      const res = await apiClient.post("/auth/connect-wallet", { address, signature }, { headers: { Authorization: `Bearer ${session.token}` } });
      const updated = { ...session, walletAddress: res.data.walletAddress };
      localStorage.setItem("efund_session", JSON.stringify(updated));
      setSession(updated);
      toast.success("Wallet connected");
      return true;
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || (err as { message?: string })?.message || "Connect wallet failed";
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiClient.post("/auth/logout");
    } catch (err) {
      console.error("Logout failed on server:", err);
    } finally {
      localStorage.removeItem("efund_session");
      setSession(null);
      setLoading(false);
      toast.info("Logged out successfully.");
      // We don't force reload window.location.href here, let the UI react to session null
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        login,
        register,
        loginWithGoogle,
        loginWithWallet,
        connectWallet,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
