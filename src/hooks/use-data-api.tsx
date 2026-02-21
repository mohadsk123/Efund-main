"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import apiClient from "@/lib/apiClient";
import { useAuth } from "./use-auth";
import { ethers } from "ethers";
import { logError, logDebug } from "@/lib/logger";

export interface Scheme {
  id: number;
  name: string;
  budget: string;
  amount: string;
  maxIncome: string;
  minAge: number;
  maxAge: number;
  gender: number;
  isActive: boolean;
}

export interface Application {
  _id: string;
  userId: string;
  userEmail: string;
  applicantAddress?: string;
  schemeId: number;
  schemeName: string;
  status: string;
  appliedAt: string;
  txHash: string;
}

export interface BeneficiaryUser {
  _id: string;
  email: string;
  walletAddress?: string;
  createdAt: string;
}

export interface GlobalStats {
  contractBalance: string;
  totalSchemes: number;
  totalApprovedBeneficiaries: number;
  totalFundsDisbursed: string;
}

export interface DisbursementData {
  beneficiaryAddress: string;
  name?: string;
  scheme?: string;
  amount: string;
  timestamp: number;
  hash?: string;
}

export function useDataApi() {
  const { session } = useAuth();
  const isAuthenticated = !!session;
  const isAdmin = session?.role === "admin";

  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [isLoadingSchemes, setIsLoadingSchemes] = useState(false);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [isGlobalStatsLoading, setIsGlobalStatsLoading] = useState(false);
  const [disbursements, setDisbursements] = useState<DisbursementData[]>([]);
  const [isDisbursementsLoading, setIsDisbursementsLoading] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryUser[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  const [isLoadingBeneficiaries, setIsLoadingBeneficiaries] = useState(false);
  const [adminStatus, setAdminStatus] = useState<{ address: string | null; balance: string | null } | null>(null);
  const [isAdminStatusLoading, setIsAdminStatusLoading] = useState(false);
  const [isDisbursingFunds, setIsDisbursingFunds] = useState(false);
  const [isDepositingFunds, setIsDepositingFunds] = useState(false);
  const [isApprovingBeneficiary, setIsApprovingBeneficiary] = useState(false);
  const [isAddingBeneficiary, setIsAddingBeneficiary] = useState(false);
  const [contractMeta, setContractMeta] = useState<{ contractAddress: string | null; chainId: number | null } | null>(null);

  const fetchAdminStatus = useCallback(async () => {
    setIsAdminStatusLoading(true);
    try {
      const res = await apiClient.get('/contract/admin-status');
      setAdminStatus(res.data);
    } catch (e) {
      console.error(e);
      setAdminStatus(null);
    } finally {
      setIsAdminStatusLoading(false);
    }
  }, []);

  const fetchSchemes = useCallback(async () => {
    setIsLoadingSchemes(true);
    try {
      const res = await apiClient.get('/contract/schemes');
      setSchemes(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingSchemes(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setIsGlobalStatsLoading(true);
    try {
      const res = await apiClient.get('/contract/stats');
      setGlobalStats(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGlobalStatsLoading(false);
    }
  }, []);

  const fetchDisbursements = useCallback(async () => {
    setIsDisbursementsLoading(true);
    try {
      const res = await apiClient.get('/contract/disbursements');
      setDisbursements(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDisbursementsLoading(false);
    }
  }, []);

  const fetchContractMeta = useCallback(async () => {
    try {
      const res = await apiClient.get('/contract/meta');
      setContractMeta(res.data);
    } catch (e) {
      console.error(e);
      setContractMeta({ contractAddress: null, chainId: null });
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingApplications(true);
    try {
      const res = await apiClient.get('/contract/my-applications');
      setApplications(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingApplications(false);
    }
  }, [isAuthenticated]);

  const fetchAllApplications = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) return;
    setIsLoadingApplications(true);
    try {
      const res = await apiClient.get('/admin/applications');
      setAllApplications(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingApplications(false);
    }
  }, [isAuthenticated, isAdmin]);

  const fetchBeneficiaries = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingBeneficiaries(true);
    try {
      const url = isAdmin ? '/admin/beneficiaries' : '/beneficiaries';
      const res = await apiClient.get(url);
      setBeneficiaries(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingBeneficiaries(false);
    }
  }, [isAuthenticated, isAdmin]);

  const refetchAllData = useCallback(() => {
    fetchSchemes();
    fetchStats();
    fetchDisbursements();
    fetchAdminStatus();
    fetchApplications();
    if (isAdmin) {
      fetchAllApplications();
    }
    fetchBeneficiaries();
    fetchContractMeta();
  }, [fetchSchemes, fetchStats, fetchDisbursements, fetchAdminStatus, fetchApplications, fetchAllApplications, fetchBeneficiaries, fetchContractMeta, isAdmin]);

  useEffect(() => {
    refetchAllData();
  }, [refetchAllData]);

  // Poll admin status for near-realtime balance updates when authenticated
  useEffect(() => {
    fetchAdminStatus();
    const timer = window.setInterval(() => {
      fetchAdminStatus();
    }, 15000);
    return () => {
      window.clearInterval(timer);
    };
  }, [fetchAdminStatus]);

  const postWithRetry = async (url: string, payload: unknown) => {
    try {
      return await apiClient.post(url, payload);
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      const transient = !!status && status >= 500;
      if (transient) {
        await new Promise(r => setTimeout(r, 1200));
        return await apiClient.post(url, payload);
      }
      throw e;
    }
  };

  type CreateSchemePayload = {
    name: string;
    amount: string;
    maxIncome: string;
    minAge: number | string;
    maxAge: number | string;
    gender: number | string;
  };
  const createScheme = async (data: CreateSchemePayload) => {
    try {
      const res = await apiClient.post('/contract/create-scheme', data);
      toast.success("Scheme created successfully!");
      fetchSchemes();
      return res.data;
    } catch (e: unknown) {
      const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || (e as { message?: string })?.message || "Failed to create scheme";
      toast.error(message);
    }
  };

  type RegisterProfilePayload = { name: string; age: string | number; gender: string | number; income: string };
  const registerProfile = async (data: RegisterProfilePayload) => {
    const { name, age, gender, income } = data;
    try {
      if (!window.ethereum) {
        toast.error("Wallet not detected. Please install MetaMask.");
        return;
        }
      const normName = String(name || "").trim();
      const normAge = Number(String(age || "").trim());
      const normGender = Number(String(gender ?? "").trim());
      const normIncome = String(income || "").trim();
      if (!normName) {
        toast.error("Please enter your name");
        return;
      }
      if (!Number.isFinite(normAge) || normAge <= 0) {
        toast.error("Please enter a valid age");
        return;
      }
      if (!Number.isFinite(normGender) || normGender < 0 || normGender > 3) {
        toast.error("Please select a valid gender");
        return;
      }
      let incomeWei: bigint;
      try {
        incomeWei = ethers.parseEther(normIncome);
      } catch {
        toast.error("Please enter a valid income in ETH (e.g., 0.05)");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum as unknown as ethers.Eip1193Provider);
      const net = await provider.getNetwork();
      if (contractMeta?.chainId && Number(net.chainId) !== Number(contractMeta.chainId)) {
        const targetHex = "0x" + Number(contractMeta.chainId).toString(16);
        try {
          await window.ethereum!.request({ method: "wallet_switchEthereumChain", params: [{ chainId: targetHex }] });
        } catch (switchErr: unknown) {
          const code = (switchErr as { code?: number })?.code;
          if (code === 4902) {
            try {
              await window.ethereum!.request({
                method: "wallet_addEthereumChain",
                params: [{
                  chainId: targetHex,
                  chainName: "Sepolia Test Network",
                  rpcUrls: ["https://rpc.sepolia.org"],
                  nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
                  blockExplorerUrls: ["https://sepolia.etherscan.io"]
                }]
              });
            } catch {
              toast.error(`Please add Sepolia Testnet (chainId ${contractMeta.chainId}) to your wallet.`);
              return;
            }
          } else {
            toast.error(`Wrong network. Switch to chain ID ${contractMeta.chainId} in MetaMask.`);
            return;
          }
        }
      }
      if (!contractMeta?.contractAddress) {
        toast.error("Blockchain not configured. Contact administrator.");
        return;
      }
      const signer = await provider.getSigner();
      const abi = [
        "function registerProfile(string,uint256,uint8,uint256)",
      ];
      const contract = new ethers.Contract(contractMeta.contractAddress, abi, signer);
      // Preflight static call to catch ABI mismatches or would-be reverts
      try {
        const method = contract.getFunction("registerProfile");
        await method.staticCall(
          normName,
          BigInt(normAge),
          BigInt(normGender),
          incomeWei
        );
      } catch (preErr: unknown) {
        const msg = (preErr as { shortMessage?: string; message?: string })?.shortMessage || (preErr as { message?: string })?.message || "";
        if (msg.includes("missing revert data")) {
          toast.error("Contract method not found or ABI mismatch at configured address. Verify contract address and ABI.");
        } else {
          toast.error(msg || "Registration simulation failed. Please check inputs.");
        }
        return;
      }
      try {
        const method = contract.getFunction("registerProfile");
        const gasEst = await method.estimateGas(
          normName,
          BigInt(normAge),
          BigInt(normGender),
          incomeWei
        );
        const fee = await provider.getFeeData();
        const gasPrice = (fee.maxFeePerGas ?? fee.gasPrice) ?? 0n;
        if (gasPrice && gasEst) {
          const ethCost = ethers.formatEther(gasEst * gasPrice);
          toast.info(`Estimated gas: ${gasEst.toString()} • Est. cost: ~${Number(ethCost).toFixed(6)} ETH`);
        }
      } catch (e) {
        logDebug("registerProfile gas estimation failed", e);
      }
      const tx = await contract.getFunction("registerProfile")(
        normName,
        BigInt(normAge),
        BigInt(normGender),
        incomeWei
      );
      await tx.wait();
      toast.success("Profile registered on-chain!");
      return { hash: tx.hash };
    } catch (e: unknown) {
      logError("registerProfile failed", e);
      const msg = (e as { shortMessage?: string; message?: string })?.shortMessage || (e as { message?: string })?.message || "Failed to register profile";
      toast.error(msg);
    }
  };

  const applyForScheme = async (schemeId: number) => {
    try {
      if (!window.ethereum) {
        toast.error("Wallet not detected. Please install MetaMask.");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum as unknown as ethers.Eip1193Provider);
      const net = await provider.getNetwork();
      if (contractMeta?.chainId && Number(net.chainId) !== Number(contractMeta.chainId)) {
        const targetHex = "0x" + Number(contractMeta.chainId).toString(16);
        try {
          await window.ethereum!.request({ method: "wallet_switchEthereumChain", params: [{ chainId: targetHex }] });
        } catch (switchErr: unknown) {
          const code = (switchErr as { code?: number })?.code;
          if (code === 4902) {
            try {
              await window.ethereum!.request({
                method: "wallet_addEthereumChain",
                params: [{
                  chainId: targetHex,
                  chainName: "Sepolia Test Network",
                  rpcUrls: ["https://rpc.sepolia.org"],
                  nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
                  blockExplorerUrls: ["https://sepolia.etherscan.io"]
                }]
              });
            } catch {
              toast.error(`Please add Sepolia Testnet (chainId ${contractMeta.chainId}) to your wallet.`);
              return;
            }
          } else {
            toast.error(`Wrong network. Switch to chain ID ${contractMeta.chainId} in MetaMask.`);
            return;
          }
        }
      }
      if (!contractMeta?.contractAddress) {
        toast.error("Blockchain not configured. Contact administrator.");
        return;
      }
      const signer = await provider.getSigner();
      const abi = [
        "function applyForScheme(uint256)",
        "function schemes(uint256) view returns (uint256,string,uint256,uint256,uint256,uint256,uint256,uint8,bool)",
        "function beneficiaries(address) view returns (string,uint256,uint8,uint256,bool,uint256)"
      ];
      const contract = new ethers.Contract(contractMeta.contractAddress, abi, signer);
      const addr = await signer.getAddress();
      // Pre-check scheme and eligibility to avoid opaque reverts
      try {
        const s = await contract.schemes(BigInt(schemeId));
        const b = await contract.beneficiaries(addr);
        const scheme = {
          budget: s[2] as bigint,
          amountPerBeneficiary: s[3] as bigint,
          maxIncomeThreshold: s[4] as bigint,
          minAge: s[5] as bigint,
          maxAge: s[6] as bigint,
          genderRequirement: Number(s[7]) as number,
          isActive: Boolean(s[8]),
        };
        const beneficiary = {
          age: b[1] as bigint,
          gender: Number(b[2]) as number,
          income: b[3] as bigint,
          isRegistered: Boolean(b[4]),
        };
        if (!scheme.isActive) {
          toast.error("Scheme not active");
          return;
        }
        if (!beneficiary.isRegistered) {
          toast.error("Please register your beneficiary profile first");
          return;
        }
        if (scheme.budget < scheme.amountPerBeneficiary) {
          toast.error("Insufficient scheme budget");
          return;
        }
        const ageOk = beneficiary.age >= scheme.minAge && beneficiary.age <= scheme.maxAge;
        if (!ageOk) {
          toast.error("Age criteria not met for this scheme");
          return;
        }
        if (beneficiary.income > scheme.maxIncomeThreshold) {
          toast.error("Income exceeds threshold for this scheme");
          return;
        }
        if (scheme.genderRequirement !== 0 && beneficiary.gender !== scheme.genderRequirement) {
          toast.error("Gender criteria not met for this scheme");
          return;
        }
      } catch (readErr) {
        logDebug("applyForScheme pre-read failed", readErr);
      }
      // Static simulate to detect ABI mismatch or would-be revert without spending gas
      try {
        const method = contract.getFunction("applyForScheme");
        await method.staticCall(BigInt(schemeId));
      } catch (preErr: unknown) {
        const msg = (preErr as { shortMessage?: string; message?: string })?.shortMessage || (preErr as { message?: string })?.message || "";
        if (msg.includes("missing revert data")) {
          toast.error("Contract method not found or ABI mismatch at configured address. Verify contract address and ABI.");
        } else {
          toast.error(msg || "Application simulation failed. Check eligibility.");
        }
        return;
      }
      try {
        const method = contract.getFunction("applyForScheme");
        const gasEst = await method.estimateGas(BigInt(schemeId));
        const fee = await provider.getFeeData();
        const gasPrice = (fee.maxFeePerGas ?? fee.gasPrice) ?? 0n;
        if (gasPrice && gasEst) {
          const ethCost = ethers.formatEther(gasEst * gasPrice);
          toast.info(`Estimated gas: ${gasEst.toString()} • Est. cost: ~${Number(ethCost).toFixed(6)} ETH`);
        }
      } catch (e) {
        logDebug("applyForScheme gas estimation failed", e);
      }
      const tx = await contract.getFunction("applyForScheme")(BigInt(schemeId));
      await tx.wait();
      await apiClient.post('/applications/record', { schemeId, txHash: tx.hash });
      toast.success("Application submitted! Funds will be disbursed if eligible.");
      refetchAllData();
      return { hash: tx.hash };
    } catch (e: unknown) {
      logError("applyForScheme failed", e);
      const msg = (e as { shortMessage?: string; message?: string })?.shortMessage || (e as { message?: string })?.message || "Application failed. Check eligibility.";
      toast.error(msg);
    }
  };

  const approveBeneficiary = async (_address: string, applicationId?: string) => {
    setIsApprovingBeneficiary(true);
    try {
      if (/^0x[a-fA-F0-9]{40}$/.test(_address)) {
        await postWithRetry('/contract/approve-beneficiary-chain', { address: _address });
      }
      await postWithRetry('/contract/approve-beneficiary', { applicationId });
      toast.success(`Application marked as approved.`);
      refetchAllData();
      return true;
    } catch (e: unknown) {
      const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || (e as { message?: string })?.message || "Failed to mark approved";
      toast.error(message);
      return false;
    } finally {
      setIsApprovingBeneficiary(false);
    }
  };

  const depositFundsToContract = async (amountEth: string, schemeId: number = 1) => {
    try {
      setIsDepositingFunds(true);
      const res = await postWithRetry('/contract/deposit', { amount: amountEth, schemeId });
      toast.success(`Deposited ${amountEth} ETH to scheme budget.`);
      fetchStats();
      return res.data;
    } catch (e: unknown) {
      const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || (e as { message?: string })?.message || "Deposit failed";
      toast.error(message);
    } finally {
      setIsDepositingFunds(false);
    }
  };

  const addBeneficiary = async (beneficiaryAddress: string, name: string, scheme: string) => {
    setIsAddingBeneficiary(true);
    try {
      const res = await postWithRetry('/contract/add-beneficiary', { address: beneficiaryAddress, name, scheme });
      toast.success("Beneficiary added on-chain");
      fetchDisbursements();
      return !!res.data;
    } catch (e: unknown) {
      const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || (e as { message?: string })?.message || "Failed to add beneficiary";
      toast.error(message);
      return false;
    } finally {
      setIsAddingBeneficiary(false);
    }
  };

  const disburseFunds = async (beneficiaryAddress: string, amountEth: string) => {
    setIsDisbursingFunds(true);
    try {
      const res = await postWithRetry('/contract/disburse', { address: beneficiaryAddress, amount: amountEth });
      toast.success("Disbursement executed");
      fetchStats();
      fetchDisbursements();
      return !!res.data;
    } catch (e: unknown) {
      const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || (e as { message?: string })?.message || "Disbursement failed";
      toast.error(message);
      return false;
    } finally {
      setIsDisbursingFunds(false);
    }
  };

  const estimateDepositGas = async (amountEth: string, schemeId: number = 1) => {
    try {
      const res = await apiClient.post('/contract/estimate-deposit', { amount: amountEth, schemeId });
      return res.data as { gas: string; costEth: string };
    } catch {
      return null;
    }
  };

  const estimateAddGas = async (address: string, name: string, scheme: string) => {
    try {
      const res = await apiClient.post('/contract/estimate-add', { address, name, scheme });
      return res.data as { gas: string; costEth: string };
    } catch {
      return null;
    }
  };

  const estimateApproveGas = async (address: string) => {
    try {
      const res = await apiClient.post('/contract/estimate-approve', { address });
      return res.data as { gas: string; costEth: string };
    } catch {
      return null;
    }
  };

  const estimateDisburseGas = async (address: string, amountEth: string) => {
    try {
      const res = await apiClient.post('/contract/estimate-disburse', { address, amount: amountEth });
      return res.data as { gas: string; costEth: string };
    } catch {
      return null;
    }
  };

  const getTxStatus = async (hash: string) => {
    try {
      const res = await apiClient.get(`/tx/${hash}`);
      return res.data as { status: 'pending' | 'success' | 'failed'; blockNumber?: number; confirmations?: number };
    } catch {
      return { status: 'pending' as const };
    }
  };

  type BeneficiaryDetails = { name?: string; scheme?: string; approved?: boolean; totalReceived?: string } | null;
  const queryBeneficiaryDetails = async (address: string): Promise<BeneficiaryDetails> => {
    try {
      const res = await apiClient.get(`/contract/beneficiary/${address}`);
      return res.data as BeneficiaryDetails;
    } catch (e: unknown) {
      console.error(e);
      return null;
    }
  };

  return {
    schemes,
    isLoadingSchemes,
    globalStats,
    isGlobalStatsLoading,
    contractMeta,
    disbursements,
    isDisbursementsLoading,
    applications,
    allApplications,
    beneficiaries,
    isLoadingApplications,
    isLoadingBeneficiaries,
    adminStatus,
    isAdminStatusLoading,
    isDisbursingFunds,
    isDepositingFunds,
    isAuthenticated,
    isApprovingBeneficiary,
    isAddingBeneficiary,
    fetchSchemes,
    refetchAllData,
    createScheme,
    registerProfile,
    applyForScheme,
    approveBeneficiary,
    depositFundsToContract,
    queryBeneficiaryDetails,
    addBeneficiary,
    disburseFunds,
    estimateDepositGas,
    estimateAddGas,
    estimateApproveGas,
    estimateDisburseGas,
    getTxStatus,
  };
}
