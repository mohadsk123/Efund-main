"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useDataApi } from "@/hooks/use-data-api";
import { Link } from "react-router-dom";
import { ethers } from "ethers";

const Schemes = () => {
  const { schemes, isLoadingSchemes, contractMeta } = useDataApi();
  const [applyHashes, setApplyHashes] = React.useState<Record<number, string>>({});

  const apply = async (schemeId: number) => {
    try {
      const ethereum = window.ethereum;
      if (!ethereum) {
        toast.error("MetaMask not detected");
        return;
      }
      try {
        const netHex = contractMeta?.chainId ? "0x" + Number(contractMeta.chainId).toString(16) : "0xaa36a7";
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: netHex }]
        });
      } catch (switchError: unknown) {
        const sw = switchError as { code?: number };
        if (sw?.code === 4902) {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: "0xaa36a7",
              chainName: "Sepolia",
              rpcUrls: ["https://eth-sepolia.g.alchemy.com/v2/A0lwY4JVuHJJWvQD9sEyF"],
              nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
              blockExplorerUrls: ["https://sepolia.etherscan.io"]
            }]
          });
        } else {
          throw switchError;
        }
      }
      const ipfsHash = applyHashes[schemeId] || "";
      if (!ipfsHash.trim()) {
        toast.error("Provide IPFS hash");
        return;
      }
      const provider = new ethers.BrowserProvider(ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const contractAddress = contractMeta?.contractAddress || "";
      if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
        toast.error("Contract not configured");
        return;
      }
      const abi = [
        "function applyToScheme(uint256,string)"
      ];
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const tx = await contract.applyToScheme(schemeId, ipfsHash);
      toast.message("Submitting application...", { description: "Awaiting confirmation on Sepolia" });
      await tx.wait();
      toast.success("Application submitted", {
        description: `Tx: ${tx.hash}`,
        action: {
          label: "View",
          onClick: () => window.open(`https://sepolia.etherscan.io/tx/${tx.hash}`, "_blank")
        }
      });
    } catch (err: unknown) {
      const e = err as { shortMessage?: string; message?: string };
      toast.error("Apply failed", { description: e?.shortMessage || e?.message || String(err) });
    }
  };

  return (
    <div className="flex flex-col gap-8 px-6 py-8 animate-fade-in-up">
      <div className="flex items-center gap-3 text-primary">
        <FileText className="h-7 w-7" />
        <h2 className="text-4xl font-bold tracking-tight text-foreground">Government Schemes</h2>
      </div>
      <p className="text-lg text-muted-foreground max-w-2xl">
        Explore and manage various government schemes. If you meet the criteria, you can apply directly to receive funds.
      </p>

      <div className="flex justify-end mb-4 animate-fade-in-up delay-100">
        <Link to="/apply">
          <Button variant="outline" className="flex items-center gap-2 h-10 px-4 py-2 text-base dark:neon-hover">
            Apply for Schemes
          </Button>
        </Link>
      </div>

      {isLoadingSchemes ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {schemes.length > 0 ? schemes.map((scheme, index) => (
            <Card key={scheme.id} className="bg-card text-card-foreground border-border shadow-sm flex flex-col dark:neon-hover animate-fade-in-up" style={{ animationDelay: `${150 + index * 50}ms` }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-semibold">{scheme.name}</CardTitle>
                <CardDescription className="text-muted-foreground line-clamp-2 text-sm">
                  Budget: {scheme.budget} ETH | Per Beneficiary: {scheme.amount} ETH
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between pt-0">
                <div className="mb-4 space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Status:{" "}
                    <span className={scheme.isActive ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                      {scheme.isActive ? "Active" : "Inactive"}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Eligibility: Age {scheme.minAge}-{scheme.maxAge} | Income {"<"} {scheme.maxIncome} ETH
                  </p>
                </div>
                <div className="flex gap-2">
                  <input
                    className="flex-1 border rounded px-2 py-1 text-sm bg-background"
                    placeholder="ipfs://CID or Qm..."
                    value={applyHashes[scheme.id] || ""}
                    onChange={e => setApplyHashes(prev => ({ ...prev, [scheme.id]: e.target.value }))}
                  />
                  <Button variant="default" onClick={() => apply(Number(scheme.id))}>
                    Apply
                  </Button>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No schemes found on the blockchain.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Schemes;
