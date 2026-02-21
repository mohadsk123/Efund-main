"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDataApi } from "@/hooks/use-data-api";
import { useAuth } from "@/hooks/use-auth";
import { User, ShieldCheck, Loader2, CheckCircle2, Wallet, FileText, ExternalLink, Clock, RefreshCw, Link as LinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getBrowserProvider, getBalance, onAccountsChanged, onChainChanged, onBlock, ensureChain } from "@/services/blockchain";
import { logDebug } from "@/lib/logger";

const BeneficiaryProfile = () => {
  const { registerProfile, queryBeneficiaryDetails, applications, isLoadingApplications } = useDataApi();
  const { session, loginWithWallet } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [profile, setProfile] = useState<{ name?: string; age?: number; income?: string; totalReceived?: string } | null>(null);
  const [walletAddr, setWalletAddr] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "0",
    income: ""
  });

  useEffect(() => {
    const checkProfile = async () => {
      const addr = session?.walletAddress || "";
      if (addr) {
        const details = await queryBeneficiaryDetails(addr);
        setProfile(details);
      }
      setChecking(false);
    };
    checkProfile();
  }, [session, queryBeneficiaryDetails]);

  useEffect(() => {
    let detachAccounts: (() => void) | null = null;
    let detachChain: (() => void) | null = null;
    let detachBlock: (() => void) | null = null;
    const init = async () => {
      try {
        const provider = getBrowserProvider();
        const net = await provider.getNetwork();
        setChainId(Number(net.chainId));
        const accs = (await provider.send("eth_accounts", [])) as string[];
        const addr = session?.walletAddress || accs[0] || null;
        setWalletAddr(addr);
        if (addr) {
          const bal = await getBalance(addr);
          setBalance(bal);
        }
        detachAccounts = onAccountsChanged(async (accts) => {
          const a = accts && accts[0] ? accts[0] : null;
          setWalletAddr(a);
          if (a) setBalance(await getBalance(a));
        });
        detachChain = onChainChanged(async (hex) => {
          const id = parseInt(hex, 16);
          setChainId(id);
          if (walletAddr) setBalance(await getBalance(walletAddr));
        });
        detachBlock = await onBlock(async () => {
          if (walletAddr) setBalance(await getBalance(walletAddr));
        });
      } catch (e) {
        logDebug("wallet init failed", e);
      }
    };
    init();
    return () => {
      detachAccounts?.();
      detachChain?.();
      detachBlock?.();
    };
  }, [session?.walletAddress, walletAddr]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await registerProfile(formData);
    const addr = session?.walletAddress || "";
    const details = addr ? await queryBeneficiaryDetails(addr) : null;
    setProfile(details);
    setLoading(false);
  };

  const handleConnectWallet = async () => {
    setConnecting(true);
    try {
      await loginWithWallet();
    } finally {
      setConnecting(false);
    }
  };

  const handleSwitchToSepolia = async () => {
    if (chainId === 11155111) return;
    await ensureChain(11155111);
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 px-6 py-8 animate-fade-in-up">
      <div className="flex items-center gap-3 text-primary">
        <User className="h-7 w-7" />
        <h2 className="text-4xl font-bold tracking-tight text-foreground">Beneficiary Profile</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" /> {profile ? "Your Blockchain Identity" : "Register Your Identity"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <CheckCircle2 className="h-10 w-10 text-primary" />
                  <div>
                    <h3 className="text-xl font-bold">{profile.name}</h3>
                    <p className="text-sm text-muted-foreground">Verified Beneficiary</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-xs text-muted-foreground">Age</p>
                    <p className="font-semibold">{profile.age} Years</p>
                  </div>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-xs text-muted-foreground">Annual Income</p>
                    <p className="font-semibold">{profile.income} ETH</p>
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-xs text-muted-foreground">Total Funds Received</p>
                  <p className="text-xl font-bold text-primary">{profile.totalReceived} ETH</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Enter your legal name" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Age</Label>
                    <Input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Annual Income (ETH)</Label>
                    <Input type="number" step="0.1" value={formData.income} onChange={e => setFormData({...formData, income: e.target.value})} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select onValueChange={v => setFormData({...formData, gender: v})}>
                    <SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Male</SelectItem>
                      <SelectItem value="2">Female</SelectItem>
                      <SelectItem value="3">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Register Profile on Blockchain"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" /> Wallet Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-md bg-muted/30">
                <p className="text-sm text-muted-foreground mb-1">Connected Address</p>
                <p className="font-mono text-sm break-all">{walletAddr || session?.walletAddress || "No wallet linked"}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded-md bg-muted/30">
                  <p className="text-xs text-muted-foreground">Wallet Balance</p>
                  <p className="font-semibold">{balance ? `${parseFloat(balance).toFixed(6)} ETH` : "—"}</p>
                </div>
                <div className="p-3 border rounded-md bg-muted/30">
                  <p className="text-xs text-muted-foreground">Network</p>
                  <p className="font-semibold">{chainId ?? "Unknown"}</p>
                </div>
              </div>
              {!session?.walletAddress && (
                <Button onClick={handleConnectWallet} className="w-full" disabled={connecting}>
                  {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4 mr-2" />}
                  Link Wallet To Profile
                </Button>
              )}
              {chainId && chainId !== 11155111 && (
                <Button onClick={handleSwitchToSepolia} variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" /> Switch to Sepolia
                </Button>
              )}
              <p className="text-sm text-muted-foreground">
                Your blockchain identity is tied to your wallet address. Ensure you are using the correct wallet to receive funds.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" /> My Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingApplications ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : applications.length > 0 ? (
                <div className="space-y-3">
                  {applications.map((app) => (
                    <div key={app._id} className="p-3 border rounded-md bg-muted/20 flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{app.schemeName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(app.appliedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={app.status === 'Disbursed' ? 'default' : 'secondary'}>
                          {app.status}
                        </Badge>
                        <a 
                          href={`https://sepolia.etherscan.io/tx/${app.txHash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[10px] text-blue-500 hover:underline flex items-center gap-1"
                        >
                          View Tx <ExternalLink className="h-2 w-2" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No applications found. Explore schemes to apply.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BeneficiaryProfile;
